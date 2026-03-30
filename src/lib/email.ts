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
    subject: 'Mã xác nhận đăng ký EnglishMore',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #14532d; margin-top: 0;">Xác nhận đăng ký EnglishMore</h2>
        <p style="color: #374151;">Mã OTP của bạn là:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #14532d; text-align: center; padding: 20px 0; background: #f0fdf4; border-radius: 8px; margin: 16px 0;">
          ${otp}
        </div>
        <p style="color: #374151;">Mã có hiệu lực trong <strong>10 phút</strong>.</p>
        <p style="color: #9ca3af; font-size: 13px;">Nếu bạn không yêu cầu đăng ký, hãy bỏ qua email này.</p>
      </div>
    `,
  })
}
