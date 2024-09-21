import mongoose from 'mongoose';

const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/messaging-app';

export const connectDB = async () => {
    let retries = 5;

    while (retries) {
        try {
            await mongoose.connect(dbURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('MongoDB connected');
            break; // اتصال موفقیت‌آمیز بود، حلقه را ترک کنید
        } catch (err) {
            retries -= 1;
            console.error('MongoDB connection error', err);
            console.log(`Retries left: ${retries}`);
            await new Promise(res => setTimeout(res, 5000)); // 5 ثانیه صبر کنید
        }
    }
};