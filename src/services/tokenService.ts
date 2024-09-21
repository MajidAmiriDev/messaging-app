import { RefreshToken } from '../models/RefreshToken';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = 'your_jwt_secret';
const JWT_REFRESH_SECRET = 'your_refresh_jwt_secret';

// Generate Access Token
export const generateAccessToken = (userId: string) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
};

// Generate Refresh Token and store it in DB
export const generateRefreshToken = async (userId: string) => {
    const refreshToken = uuidv4(); // Use a unique ID as the token value
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Refresh token valid for 7 days

    await RefreshToken.create({ userId, token: refreshToken, expiresAt });

    return refreshToken;
};

// Validate and refresh tokens
export const refreshAccessToken = async (refreshToken: string) => {
    const tokenDoc = await RefreshToken.findOne({ token: refreshToken });

    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
        throw new Error('Invalid or expired refresh token');
    }

    const newAccessToken = generateAccessToken(tokenDoc.userId);
    return newAccessToken;
};