import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendVerificationEmail = async (toEmail, name, token) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    console.log('------------------------------------------------');
    console.log(`[DEV MODE] Verification Link for ${toEmail}:`);
    console.log(verificationUrl);
    console.log('------------------------------------------------');

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return;
    }

    const mailOptions = {
        from: `"Admin Store" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: 'Verify Your Account',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Hello, ${name}!</h2>
                <p>Please click the button below to verify your email:</p>
                <a href="${verificationUrl}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
                <p style="margin-top: 20px; color: #888;">This link expires in 24 hours.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email sending failed (Check .env):', error.message);
    }
};