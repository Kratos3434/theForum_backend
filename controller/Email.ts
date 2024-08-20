import nodemailer from 'nodemailer';

class Email {
    private static transporter = nodemailer.createTransport({
        service: 'gmail',
        name: 'theForum',
        auth: {
            user: 'keithcarlos34@gmail.com',
            pass: process.env.MAIL_PASS
        }
    });

    public static async sendLink(to: string, url: string) {
        const mailOptions = {
            from: 'keithcarlos34@gmail.com',
            to,
            subject: "Verify email",
            html: `
                <small>Dear ${to}</small>,
                <div></div>
                <div>
                    <p>Welcome to  <b>The Forum!</b> Click the link below to activate your account</p>
                    <a href="${url}" target="_blank">Activate account</a>
                    <p>Thank you,</p>
                    <p>The Forum team</p>
                </div>
             `
        }

        await Email.transporter.sendMail(mailOptions);
    }
}

export default Email;