
import { Resend } from "resend";
import { generateVerificationHTML } from "../helper/email-template";

const resend = new Resend(process.env.RESEND_API_KEY!);

interface verificationProps {
    email: string
    name: string
    verificationUrl: string
}

async function sendVerificationMail({ email, name, verificationUrl }: verificationProps) {

    const result = await resend.emails.send({
        from: "Zosmed <noreply@zosmed.com>",
        to: email,
        subject: "Welcome to Zosmed Waiting List! 🎉",
        html: generateVerificationHTML({ name, verificationUrl }),
    });

    return result;
}

export default sendVerificationMail