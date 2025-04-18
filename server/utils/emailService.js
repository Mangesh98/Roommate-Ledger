const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendVerificationEmail = async (email, verificationToken) => {
   
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - Roommate Ledger',
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendEmail = async (msg) => {
  await transporter.sendMail(msg);
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: "Reset Your Password - Roommate Ledger",
    html: `
      <p>You requested a password reset for your Roommate Ledger account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  await sendEmail(msg);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };