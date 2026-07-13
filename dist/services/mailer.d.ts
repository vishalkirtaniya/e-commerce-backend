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
export declare function sendOtpEmail(to: string, otp: string): Promise<void>;
//# sourceMappingURL=mailer.d.ts.map