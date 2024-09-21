import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { generateAccessToken, generateRefreshToken, refreshAccessToken } from '../services/tokenService';
import logger from '../utils/logger';
import User from '../models/user';
import LoginAttempt from '../models/loginAttempt';
import { sendAlertEmail } from '../utils/mailer';
import { sendMessage } from '../utils/rabbitmq';
import crypto from 'crypto';

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
            const message = JSON.stringify(req.body);
            sendMessage(message);
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


    async requestPasswordReset(req: Request, res: Response) {
        const { email } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // تولید توکن بازیابی
            const token = crypto.randomBytes(32).toString('hex');
            user.passwordResetToken = token;
            user.passwordResetExpires = Date.now() + 3600000; // توکن یک ساعت معتبر است
            await user.save();

            // ارسال ایمیل بازیابی رمز عبور
            sendResetEmail(email, token);
            res.status(200).json({ message: 'Reset password email sent' });
        } catch (error) {
            logger.error(`Error requesting password reset for ${email}: ${error.message}`);
            res.status(500).json({ message: 'Error processing request' });
        }
    }

    async resetPassword(req: Request, res: Response) {
        const { token, newPassword } = req.body;

        try {
            const user = await User.findOne({
                passwordResetToken: token,
                passwordResetExpires: { $gt: Date.now() }, // بررسی توکن
            });

            if (!user) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }

            // تنظیم رمز عبور جدید
            user.password = newPassword; // هش کردن رمز عبور در مدل User
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();

            res.status(200).json({ message: 'Password has been reset' });
        } catch (error) {
            logger.error(`Error resetting password: ${error.message}`);
            res.status(500).json({ message: 'Error resetting password' });
        }
    }


}

export const authController = new AuthController();