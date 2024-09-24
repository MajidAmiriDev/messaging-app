import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { connectRabbitMQ } from './utils/rabbitmq';
import { connectDB } from './db';
import rateLimit from 'express-rate-limit';
import { register, login, refreshAccessTokenController, requestPasswordReset, resetPassword } from './controllers/authController';
import { setUserStatus, getUserStatus } from './redis';
import { errorHandler } from './middleware/errorHandler';

// مدیریت خطاهای uncaughtException
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // process.exit(1);
});

// مدیریت خطاهای unhandledRejection
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // process.exit(1);
});

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.json());

const init = async () => {
    try {
        await connectRabbitMQ();
        await connectDB();

        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each IP to 100 requests per windowMs
            message: 'Too many requests, please try again later.',
        });
        app.use(limiter);

        app.post('/register', register);
        app.post('/login', login);
        app.post('/refresh-token', refreshAccessTokenController);
        app.post('/request-password-reset', requestPasswordReset);
        app.post('/reset-password', resetPassword);
        app.use(errorHandler);

        io.on('connection', (socket) => {
            console.log('New client connected');

            socket.on('sendMessage', (message) => {
                io.emit('receiveMessage', message);
                // Here we will later integrate RabbitMQ
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });

        server.listen(5000, () => console.log('Server running on port 5000'));
    } catch (err) {
        console.error('Initialization error:', err);
        process.exit(1); // در صورت خطا در راه‌اندازی، اپلیکیشن را متوقف می‌کنیم
    }
};

init();