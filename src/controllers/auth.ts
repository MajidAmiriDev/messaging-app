import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { generateAccessToken, generateRefreshToken, refreshAccessToken } from '../services/tokenService';

// User registration
export const register = async ( req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        const user = await registerUser(username, email, password);
        const accessToken = generateAccessToken(user._id);
        const refreshToken = await generateRefreshToken(user._id);

        res.status(201).json({ message: 'User registered successfully', accessToken, refreshToken });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// User login
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const { user, accessToken } = await loginUser(email, password);
        const refreshToken = await generateRefreshToken(user._id);

        res.status(200).json({ message: 'Login successful', accessToken, refreshToken });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Refresh Access Token
export const refreshAccessTokenController = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        const newAccessToken = await refreshAccessToken(refreshToken);
        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};