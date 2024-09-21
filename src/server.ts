import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import amqp from 'amqplib/callback_api';
import { connectDB } from './db';
import { register, login } from './controllers/auth';
import { setUserStatus, getUserStatus } from './redis';




const server = http.createServer(app);
const io = new Server(server);
const app = express();
app.use(express.json());

connectDB();

app.post('/register', register);
app.post('/login', login);
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