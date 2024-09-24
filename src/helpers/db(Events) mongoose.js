
// #1
// Event Listeners
import mongoose from 'mongoose';

const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/messaging-app';

mongoose.connection.on('connected', () => {
    console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB connection disconnected');
});

const connectDB = async () => {
    try {
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    }
};

connectDB();
// #####################################################

//2
// send email
// const sendErrorEmail = async (errorMessage: string) => {
//     await transporter.sendMail({
//         from: process.env.EMAIL_USER,
//         to: 'admin@example.com',
//         subject: 'MongoDB Connection Error',
//         text: `Failed to connect to MongoDB: ${errorMessage}`,
//     });
// };
// await sendErrorEmail(err.message);

// #############################################################