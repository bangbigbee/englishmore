import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendOtpEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? process.env.EMAIL_USER,
    to,
    subject: 'EnglishMore registration verification code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: var(--primary-900); margin-top: 0;">Verify your EnglishMore registration</h2>
        <p style="color: #374151;">Your OTP code is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: var(--primary-900); text-align: center; padding: 20px 0; background: var(--primary-50); border-radius: 8px; margin: 16px 0;">
          ${otp}
        </div>
        <p style="color: #374151;">This code will expire in <strong>10 minutes</strong>.</p>
        <p style="color: #9ca3af; font-size: 13px;">If you did not request this registration, you can ignore this email.</p>
      </div>
    `,
  })
}
