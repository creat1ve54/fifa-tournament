import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: `"GazLiga" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
    });
    console.log("✅ Письмо отправлено:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Ошибка отправки письма:", error);
    return false;
  }
}
