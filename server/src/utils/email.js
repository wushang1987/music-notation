const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, token) => {
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify/${token}`;

    try {
        const { data, error } = await resend.emails.send({
            from: 'Music Notation <onboarding@resend.dev>',
            to: [email],
            subject: 'Verify your email address',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
                    <h1 style="color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Welcome to Music Notation!</h1>
                    <p style="color: #475569; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                        Thanks for signing up. Please click the button below to verify your email address and complete your registration.
                    </p>
                    <a href="${verificationUrl}" style="display: inline-block; background-color: #2563eb; color: white; font-weight: 600; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-bottom: 24px;">
                        Verify Email Address
                    </a>
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
                        Or copy and paste this link into your browser: <br>
                        <a href="${verificationUrl}" style="color: #2563eb;">${verificationUrl}</a>
                    </p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
                    <p style="color: #94a3b8; font-size: 12px;">
                        If you didn't create an account, you can safely ignore this email.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            throw new Error(error.message);
        }

        return data;
    } catch (err) {
        console.error('Failed to send verification email:', err);
        throw err;
    }
};

const sendResetPasswordEmail = async (email, token) => {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;

    try {
        const { data, error } = await resend.emails.send({
            from: 'Music Notation <onboarding@resend.dev>',
            to: [email],
            subject: 'Reset your password',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h1 style="color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Reset Your Password</h1>
                    <p style="color: #475569; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                        You requested to reset your password. Please click the button below to set a new password. This link will expire in 1 hour.
                    </p>
                    <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: white; font-weight: 600; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-bottom: 24px;">
                        Reset Password
                    </a>
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
                        Or copy and paste this link into your browser: <br>
                        <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
                    </p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
                    <p style="color: #94a3b8; font-size: 12px;">
                        If you didn't request a password reset, you can safely ignore this email.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            throw new Error(error.message);
        }

        return data;
    } catch (err) {
        console.error('Failed to send reset password email:', err);
        throw err;
    }
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };
