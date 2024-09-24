import { User, IUser } from '../models/User';
import winston from 'winston';

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
    try {
        const user = await User.findOne({ email });

        if (!user) {
            winston.warn(`User with email ${email} not found`);
            return null; // یا می‌توانید یک خطای کاربر یافت نشد به صورت سفارشی برگردانید
        }

        return user;
    } catch (err: any) {
        // لاگ کردن خطا
        winston.error(`Error while finding user by email: ${err.message}`, { metadata: err });

        // می‌توانید خطای مناسب‌تری را به بالا بازگردانید
        throw new Error('Error finding user by email');
    }
};

export const createUser = async (username: string, email: string, passwordHash: string): Promise<IUser> => {
    try {
        const existingUser = await User.findOne({ email });

        // اگر کاربری با این ایمیل وجود داشته باشد، خطای مناسب تولید می‌شود
        if (existingUser) {
            winston.warn(`User with email ${email} already exists`);
            throw new Error('User already exists');
        }

        const user = new User({ username, email, passwordHash });

        // ذخیره‌سازی کاربر جدید در دیتابیس
        await user.save();
        winston.info(`User created successfully with email: ${email}`);

        return user;
    } catch (err: any) {
        // لاگ کردن خطا
        winston.error(`Error while creating user: ${err.message}`, { metadata: err });

        // ارسال یک خطای مناسب به بالا
        throw new Error('Error creating user');
    }
};