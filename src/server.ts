import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import amqp from 'amqplib/callback_api';
import { connectDB } from './db';
import rateLimit from 'express-rate-limit';
import { register, login, refreshAccessTokenController } from './controllers/authController';
import { setUserStatus, getUserStatus } from './redis';
import { errorHandler } from './middleware/errorHandler';




const server = http.createServer(app);
const io = new Server(server);
const app = express();
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
});
app.use(limiter);

connectDB();

app.post('/register', register);
app.post('/login', login);
app.post('/refresh-token', refreshAccessTokenController);
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
app.listen(5000, () => console.log('Server running on port 5000'));