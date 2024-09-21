import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const JWT_SECRET = 'your_jwt_secret';

// Register User
export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, passwordHash });
    await newUser.save();

    res.json({ message: 'User registered' });
};

// Login User
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
};