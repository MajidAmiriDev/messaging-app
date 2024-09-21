import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { generateAccessToken, generateRefreshToken, refreshAccessToken } from '../services/tokenService';
import logger from '../utils/logger';
import User from '../models/user';
import LoginAttempt from '../models/loginAttempt';
import { sendAlertEmail } from '../utils/mailer';


class AuthController {
    async register(req: Request, res: Response) {
        try {
            const { username, email, password } = req.body;
            const user = await registerUser(username, email, password);
            if (!user.isPasswordStrong(password)) {
                return res.status(400).json({ message: 'Password is too weak. Please choose a stronger password (at least 8 characters, including uppercase, lowercase, numbers, and symbols).' });
            }
            const accessToken = generateAccessToken(user._id);
            const refreshToken = await generateRefreshToken(user._id);
            logger.info(`User registered: ${email}`);
            res.status(201).json({ message: 'User registered successfully', accessToken, refreshToken });
        } catch (error) {
            logger.error(`Registration failed for ${req.body.email}: ${error.message}`);
            res.status(400).json({ message: error.message });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const { user, accessToken } = await loginUser(email, password);
            const ipAddress = req.ip;
            const deviceInfo = req.get('User-Agent');
            await LoginAttempt.create({
                userId: user._id,
                ipAddress,
                deviceInfo,
            });
            const loginAttempts = await LoginAttempt.find({ userId: user._id }).sort({ timestamp: -1 }).limit(5);
            const suspiciousLogin = loginAttempts.some(attempt => attempt.ipAddress !== ipAddress);

            if (suspiciousLogin) {
                sendAlertEmail(user.email, `Suspicious login attempt detected from a different IP: ${ipAddress}`);
            }
            
            const refreshToken = await generateRefreshToken(user._id);
            logger.info(`User logged in: ${email}`);
            res.status(200).json({ message: 'Login successful', accessToken, refreshToken });
        } catch (error) {
            logger.error(`Login failed for ${req.body.email}: ${error.message}`);
            res.status(400).json({ message: error.message });
        }
    }

    async refreshToken(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;
            const newAccessToken = await refreshAccessToken(refreshToken);
            res.status(200).json({ accessToken: newAccessToken });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

export const authController = new AuthController();