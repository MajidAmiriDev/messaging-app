import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'YOUR_EMAIL@gmail.com',
        pass: 'YOUR_EMAIL_PASSWORD',
    },
});


export const sendResetEmail = (to: string, token: string) => {
    const resetLink = `http://yourapp.com/reset-password?token=${token}`;
    const mailOptions = {
        from: 'YOUR_EMAIL@gmail.com',
        to,
        subject: 'Password Reset',
        text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};


export const sendAlertEmail = (to: string, message: string) => {
    const mailOptions = {
        from: 'YOUR_EMAIL@gmail.com',
        to,
        subject: 'Security Alert: Suspicious Login Attempt',
        text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};