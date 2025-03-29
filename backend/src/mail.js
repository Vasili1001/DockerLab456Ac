const nodemailer = require('nodemailer');

async function sendMail({ to, subject, text }) {
  if (!to || !subject || !text) {
    throw new Error('❌ Missing email parameters: to, subject, or text.');
  }

  const transportConfig = {
    host: process.env.SMTP_HOST || 'mailhog',
    port: Number(process.env.SMTP_PORT) || 1025,
    secure: false,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  };

  const transporter = nodemailer.createTransport(transportConfig);

  try {
    const info = await transporter.sendMail({
      from: '"ToDo App" <no-reply@todoapp.com>',
      to,
      subject,
      text,
    });

    console.log(`✅ Email sent to ${to}:`, info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    if (error.response) {
      console.error('📩 SMTP Response:', error.response);
    }
    throw new Error('Failed to send email');
  }
}

module.exports = { sendMail };
