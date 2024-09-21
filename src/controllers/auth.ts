import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';

// User registration
export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        const user = await registerUser(username, email, password);
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// User login
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await loginUser(email, password);
        res.status(200).json({ message: 'Login successful', user, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};