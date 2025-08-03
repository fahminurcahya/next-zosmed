
import { Resend } from "resend";
import { generateResetPasswordHTML, generateVerificationHTML } from "../helper/email-template";

const resend = new Resend(process.env.RESEND_API_KEY!);

interface verificationProps {
    email: string
    name: string
    verificationUrl: string
}

export async function sendVerificationMail({ email, name, verificationUrl }: verificationProps) {

    const result = await resend.emails.send({
        from: "Zosmed <noreply@zosmed.com>",
        to: email,
        subject: "Verify Your Email to Activate Your Zosmed Account ✅",
        html: generateVerificationHTML({ name, verificationUrl }),
    });

    return result;
}

interface SendEmailOptions {
    to: string;
    name: string;
    url: string;
}

export async function sendResetPassword({ to, name, url }: SendEmailOptions) {
    try {
        const data = await resend.emails.send({
            from: 'Zosmed <noreply@zosmed.com>',
            to,
            subject: "Reset Password - Zosmed",
            html: generateResetPasswordHTML({ name, url }),
        });

        return { success: true, data };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error };
    }
}

