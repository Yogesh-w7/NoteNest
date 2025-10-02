import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey", // required for SendGrid
    pass: process.env.SENDGRID_API_KEY
  }
});

export async function sendOTPEmail(email: string, otp: string) {
  try {
    await transporter.sendMail({
      from: '"NoteApp" <redg0336@gmail.com>', // ✅ must match a verified sender in SendGrid
      to: email,
      subject: "Your NoteApp OTP",
      html: `<p>Your OTP is: <strong>${otp}</strong></p><p>Expires in 10 minutes</p>`
    });
    console.log("✅ OTP sent to", email);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
}
