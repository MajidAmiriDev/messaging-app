import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { findUserByEmail, createUser } from '../repositories/userRepository';

const JWT_SECRET = 'your_jwt_secret';

// Register new user
export const registerUser = async (username: string, email: string, password: string) => {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    const passwordHash = await argon2.hash(password);
    const newUser = await createUser(username, email, passwordHash);
    return newUser;
};

// Authenticate user and generate JWT token
export const loginUser = async (email: string, password: string) => {
    const user = await findUserByEmail(email);
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isMatch = await argon2.verify(user.passwordHash, password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    return { user, token };
};