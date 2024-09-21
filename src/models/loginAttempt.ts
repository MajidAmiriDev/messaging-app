import mongoose from 'mongoose';

const loginAttemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ipAddress: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    deviceInfo: { type: String }, // اطلاعات دستگاه
});

const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);
export default LoginAttempt;