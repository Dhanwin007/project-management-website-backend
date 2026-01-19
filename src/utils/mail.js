import Mailgen from 'mailgen';

import nodemailer from 'nodemailer';
// for sendng the email u need to provide all these data
const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'Task Manager',
      link: 'https://taskmanagerlink.com',
    },
  });
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHtml = mailGenerator.generate(options.mailgenContent);
  const transporter = nodemailer.createTransport({
    //important
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  const mail = {
    from: 'mail.taskmanager@example.com',
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };
  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error(
      'error occured while sending the mail,MAke sure that mailtrap credentials are provided oroperly in the .env file',
    );
  }
};

const emailVerificationMailgenContent = function (username, verificationUrl) {
  let email = {
    body: {
      name: username,
      intro: "Welcome to our app! We're very excited to have you on board.",
      action: {
        instructions: 'To verify your email, please click here:',
        button: {
          color: '#22BC66', // Optional action button color
          text: 'Confirm your account',
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
  return email;
};
const forgotPasswordMailgenContent = function (username, passwordResetUrl) {
  let email = {
    body: {
      name: username,
      intro: 'We got a request to reset your password',
      action: {
        instructions: 'To reset your password, please click here:',
        button: {
          color: '#22BC66', // Optional action button color
          text: 'Reset Password',
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
  return email;
};
export {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
};
