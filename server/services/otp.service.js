import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Otp from '../models/Otp.models.js';
import { ApiError } from '../utils/ApiError.js';


export async function generateAndSendOtp(email) {
  const plain = crypto.randomInt(100000, 999999).toString();

  await Otp.deleteMany({ email }); 
  await Otp.create({ email, otp: plain });

  await sendOtpEmail(email, plain);
}

export async function validateOtp(email, candidate) {
  const record = await Otp.findOne({ email });

  if (!record) {
    throw new ApiError(400, 'OTP expired or not found. Please request a new one.');
  }

  const valid = await record.verifyOtp(candidate);
  if (!valid) {
    throw new ApiError(400, 'Invalid OTP. Please try again.');
  }
 
  await Otp.deleteOne({ _id: record._id }); 
}


async function sendOtpEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: `"AskTheCompiler" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Verify your AskTheCompiler account',
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:auto">
        <h2 style="color:#6366f1">&gt;_ AskTheCompiler</h2>
        <p>Thanks for signing up. Use the OTP below to verify your email.</p>
        <div style="font-size:2.2rem;font-weight:bold;letter-spacing:10px;
                    color:#6366f1;padding:16px 0">
          ${otp}
        </div>
        <p>This code expires in <strong>10 minutes</strong> and can only be used once.</p>
        <p style="color:#888;font-size:0.8rem">
          If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
  });
}