const nodemailer = require("nodemailer");

const emailConfigurato =
    Boolean(process.env.EMAIL_USER) &&
    Boolean(process.env.EMAIL_PASSWORD);

const transporter = emailConfigurato
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    : null;

async function sendEmail({ to, subject, text }) {
    if (!emailConfigurato) {
        console.log(
            "Email non inviata (EMAIL_USER/EMAIL_PASSWORD non configurati):",
            subject
        );
        return;
    }

    if (!to) {
        return;
    }

    await transporter.sendMail({
        from: `"Ticketing Helpdesk" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text
    });
}

module.exports = { sendEmail };
