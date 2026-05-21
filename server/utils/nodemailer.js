const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Check if SMTP is configured in env
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n--- [EMAIL ALERT SIMULATION (SMTP Not Configured)] ---');
    console.log(`To:      ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.text}`);
    console.log('------------------------------------------------------\n');
    return { simulated: true, success: true };
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Message details
  const message = {
    from: `${process.env.EMAIL_FROM || 'noreply@financetracker.com'}`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html || `<p>${options.text}</p>`
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Nodemailer Email sent successfully: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Nodemailer email transport failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
