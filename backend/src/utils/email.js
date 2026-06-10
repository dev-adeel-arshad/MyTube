import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";

const sendEmail = async ({ to, subject, text, html }) => {
  const user = process.env.EMAIL_USER;
  const rawPass = process.env.EMAIL_PASS || "";
  const pass = rawPass.replace(/\s+/g, "");
  const from = process.env.EMAIL_FROM || user;

  if (!user || !pass || !from) {
    throw new ApiError(500, "Email service not configured");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};

const buildOtpEmail = ({ code, title, intro, footer }) => {
  const safeCode = String(code);
  return {
    subject: title,
    text: `${intro}\n\nYour verification code is: ${safeCode}\n\n${footer}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111;">
        <h2>${title}</h2>
        <p>${intro}</p>
        <p style="font-size: 20px; font-weight: bold; letter-spacing: 2px;">${safeCode}</p>
        <p>${footer}</p>
      </div>
    `,
  };
};

export { sendEmail, buildOtpEmail };
