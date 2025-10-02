import express from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../utils/mailer";
import { JWT_SECRET } from "../config";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: sign JWT token
function signToken(user: any) {
  return jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
}

// 1) Request OTP (signup)
router.post("/request-otp", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });

    let user = await User.findOne({ email });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (!user) {
      user = new User({ 
        name, 
        email, 
        password: await bcrypt.hash(password, 10), 
        otp, 
        otpExpiry 
      });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      if (password) user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    try {
      await sendOTPEmail(email, otp);
    } catch (mailErr) {
      console.error("Email sending failed:", mailErr);
      return res.status(500).json({ message: "OTP generated but email sending failed" });
    }

    return res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Request OTP error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// 2) Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired or not requested" });
    }

    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = signToken(user);
    res.cookie("token", token, { httpOnly: true, maxAge: 7*24*3600*1000, sameSite: "lax" });
    return res.json({ message: "Verified", user: { id: user._id, email: user.email, name: user.name } });

  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// 3) Login (email/password)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.isVerified) return res.status(400).json({ message: "Please verify your email" });

    const ok = await bcrypt.compare(password, user.password || "");
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(user);
    res.cookie("token", token, { httpOnly: true, maxAge: 7*24*3600*1000, sameSite: "lax" });
    return res.json({ message: "Logged in", user: { id: user._id, email: user.email, name: user.name } });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// 4) Google sign-in
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = payload?.email!;
    const name = payload?.name!;
    const sub = payload?.sub!;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, isVerified: true, googleId: sub });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = sub;
      user.isVerified = true;
      await user.save();
    }

    const token = signToken(user);
    res.cookie("token", token, { httpOnly: true, maxAge: 7*24*3600*1000, sameSite: "lax" });
    return res.json({ message: "OK", user: { id: user._id, name: user.name, email: user.email } });

  } catch (err) {
    console.error("Google login error:", err);
    return res.status(500).json({ message: "Google login failed" });
  }
});

// 5) Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.json({ user: null });

    const data = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(data.id).select("-password -otp -otpExpiry");
    return res.json({ user });

  } catch {
    return res.json({ user: null });
  }
});

// 6) Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

export default router;
