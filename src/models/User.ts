import mongoose, { Schema, Document } from 'mongoose';
import zxcvbn from 'zxcvbn';
import winston from 'winston';

// تنظیمات لاگ با استفاده از winston
const logger = winston.createLogger({
    transports: [
        new winston.transports.File({ filename: 'logs/mongodb-errors.log' }),
        new winston.transports.Console(),
    ],
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, metadata }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message} ${
                metadata ? `\nMetadata: ${JSON.stringify(metadata)}` : ''
            }`;
        })
    ),
});

// Define the User interface
export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    profilePicUrl?: string;
    bio?: string;
    role: 'user' | 'admin';
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

// User schema definition
const UserSchema: Schema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 50,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        profilePicUrl: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            maxlength: 200,
            default: '',
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        passwordResetToken: { type: String },
        passwordResetExpires: { type: Date },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Middleware برای مدیریت خطاها بعد از عملیات ذخیره‌سازی
UserSchema.post('save', function (error, doc, next) {
    if (error) {
        if (error.name === 'MongoError' && error.code === 11000) {
            // خطای یکتا بودن ایمیل یا نام کاربری
            logger.error(`Duplicate key error: ${error.message}`, { metadata: error });
            next(new Error('User with this email or username already exists'));
        } else {
            logger.error(`Error while saving user: ${error.message}`, { metadata: error });
            next(error); // انتقال خطا به middleware بعدی
        }
    } else {
        next();
    }
});

// Add virtual fields if necessary
UserSchema.virtual('fullName').get(function () {
    return this.username; // Modify as needed (e.g., for first and last names)
});

// Indexing fields for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

// متد برای بررسی قدرت پسورد
UserSchema.methods.isPasswordStrong = function (password: string) {
    const passwordStrength = zxcvbn(password);
    return passwordStrength.score >= 3; // حداقل نمره 3
};

// Export the User model
const User = mongoose.model<IUser>('User', UserSchema);
export default User;