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
    }
};

export const sendMessage = (message: string) => {
    if (!channel) {
        throw new Error('Channel not initialized');
    }
    channel.sendToQueue('messages', Buffer.from(message), { persistent: true });
};