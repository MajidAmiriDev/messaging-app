import mongoose from 'mongoose';
import winston from 'winston';

// تنظیمات لاگ با استفاده از winston
const logger = winston.createLogger({
    transports: [
        new winston.transports.File({ filename: 'logs/mongodb-errors.log' }), // لاگ کردن در فایل
        new winston.transports.Console(), // لاگ کردن در کنسول
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

// اطلاعات اتصال به MongoDB
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/messaging-app';

// تابع اتصال به MongoDB با مکانیزم retry
export const connectDB = async () => {
    let retries = 5; // تعداد تلاش‌ها برای اتصال مجدد

    // تایم‌اوت برای ایجاد تاخیر بین تلاش‌ها
    const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    while (retries) {
        try {
            // تلاش برای اتصال به MongoDB
            await mongoose.connect(dbURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000, // محدودیت زمانی برای انتخاب سرور
                poolSize: 10, // تعداد کانکشن‌های فعال همزمان
            });

            console.log('MongoDB connected');
            logger.info('MongoDB connected successfully');
            break; // اگر اتصال موفق بود، از حلقه خارج شوید
        } catch (err: any) {
            retries -= 1; // کم کردن تعداد تلاش‌های باقی‌مانده

            // لاگ کردن خطا
            logger.error(`MongoDB connection error: ${err.message}`, {
                metadata: err,
            });

            if (retries === 0) {
                // اگر تمام تلاش‌ها ناموفق بود، برنامه را خارج کنید
                logger.error('All retries exhausted. Exiting the application...');
                process.exit(1); // خروج با کد 1 به معنی خطا
            } else {
                // اگر هنوز فرصت تلاش باقی است
                console.log(`Retries left: ${retries}`);
                logger.warn(`Retries left: ${retries}`);
                await timeout(5000); // 5 ثانیه تاخیر قبل از تلاش مجدد
            }
        }
    }
};
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
    logger.info('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err}`);
    logger.error(`MongoDB connection error: ${err.message}`, { metadata: err });

    // اقدام به خروج یا اقدام‌های دیگری که در زمان وقوع خطا نیاز است
    process.exit(1); // اگر نیاز به متوقف کردن برنامه باشد
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
    logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
    logger.info('MongoDB reconnected');
});

mongoose.connection.on('close', () => {
    console.warn('MongoDB connection closed');
    logger.warn('MongoDB connection closed');
});