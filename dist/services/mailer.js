"use strict";
/**
 * services/mailer.ts
 * Single nodemailer instance shared across the whole app.
 * Import sendOtpEmail wherever you need to send OTP emails.
 *
 * .env:
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=your@gmail.com
 *   SMTP_PASS=your_app_password    ← Gmail: use an App Password
 *   SMTP_FROM="Shop.co <your@gmail.com>"
 *   OTP_EXPIRY_MINUTES=10
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = sendOtpEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
async function sendOtpEmail(to, otp) {
    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject: "Your password reset code",
        html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; color: #111;">
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">
          Reset your password
        </h2>
        <p style="color: #666; font-size: 15px; margin-bottom: 24px;">
          Use the code below to reset your password. It expires in
          <strong>${process.env.OTP_EXPIRY_MINUTES ?? 10} minutes</strong>.
        </p>
        <div style="
          font-size: 42px; font-weight: 800; letter-spacing: 12px;
          color: #111; text-align: center; padding: 28px 16px;
          background: #f5f5f5; border-radius: 12px; margin-bottom: 24px;
        ">${otp}</div>
        <p style="color: #999; font-size: 13px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
    });
}
//# sourceMappingURL=mailer.js.map