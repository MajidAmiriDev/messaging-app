import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
    const rabbitMQURL = process.env.RABBITMQ_URL || 'amqp://localhost';
    let retries = 5;

    while (retries) {
        try {
            const connection = await amqp.connect(rabbitMQURL);
            channel = await connection.createChannel();
            console.log('RabbitMQ connected');

            // تنظیمات کانال (در صورت نیاز)
            await channel.assertQueue('messages', { durable: true }); // صف پیام‌ها
            break; // اتصال موفقیت‌آمیز بود، حلقه را ترک کنید
        } catch (err) {
            retries -= 1;
            console.error('RabbitMQ connection error', err);
            console.log(`Retries left: ${retries}`);
            await new Promise(res => setTimeout(res, 5000)); // 5 ثانیه صبر کنید
        }

        if (retries === 0) {
            throw new Error('Failed to connect to RabbitMQ after several attempts');
        }
    }
};

export const sendMessage = (message: string) => {
    if (!channel) {
        throw new Error('Channel not initialized');
    }

    try {
        const sent = channel.sendToQueue('messages', Buffer.from(message), { persistent: true });
        if (!sent) {
            console.error('Failed to send message to the queue');
            throw new Error('Message not sent');
        }
        console.log('Message sent to queue:', message);
    } catch (err) {
        console.error('Error sending message', err);
        throw new Error('Error sending message to RabbitMQ');
    }
};