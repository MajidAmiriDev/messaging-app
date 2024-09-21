import mongoose, { Schema, Document } from 'mongoose';
import zxcvbn from 'zxcvbn';
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
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Add virtual fields if necessary
UserSchema.virtual('fullName').get(function () {
    return this.username; // Modify as needed (e.g., for first and last names)
});

// Indexing fields for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
userSchema.methods.isPasswordStrong = function(password: string) {
    const passwordStrength = zxcvbn(password);
    return passwordStrength.score >= 3; // حداقل نمره 3
};
// Export the User model
const User = mongoose.model('User', userSchema);
export default User;
