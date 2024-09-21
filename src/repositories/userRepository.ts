import { User, IUser } from '../models/User';

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
    return await User.findOne({ email });
};

export const createUser = async (username: string, email: string, passwordHash: string): Promise<IUser> => {
    const user = new User({ username, email, passwordHash });
    return await user.save();
};