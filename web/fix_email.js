const fs = require('fs');
const path = require('path');

const fp = path.join(process.cwd(), 'src', 'app', 'actions', 'user.ts');
let content = fs.readFileSync(fp, 'utf8');

// Ensure nodemailer is imported
if (!content.includes('import nodemailer')) {
  content = content.replace('import bcrypt', 'import nodemailer from "nodemailer";\nimport bcrypt');
}

const target = `    const resetToken = "reset-" + user.id + "-" + Date.now();
    await prisma.user.update({
      where: { id: user.id },
      data: { resetCode: resetToken }
    });

    return { success: true, token: resetToken, message: "Simulated reset email sent." };`;

const replacement = `    const resetToken = "reset-" + user.id + "-" + Date.now();
    await prisma.user.update({
      where: { id: user.id },
      data: { resetCode: resetToken }
    });

    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_APP_PASSWORD;

    if (EMAIL_USER && EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
          }
        });

        const resetUrl = \`\${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password?token=\${resetToken}\`;

        await transporter.sendMail({
          from: \`"PickNwear Support" <\${EMAIL_USER}>\`,
          to: email,
          subject: "Password Reset Request - PickNwear",
          html: \`
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
              <h2 style="color: #000; font-size: 24px; margin-bottom: 20px;">Reset Your Password</h2>
              <p style="color: #555; font-size: 16px; margin-bottom: 30px;">Hi \${user.name}, you recently requested to reset your password for your PickNwear account. Click the button below to proceed.</p>
              <a href="\${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Password</a>
              <p style="color: #999; font-size: 12px; margin-top: 40px;">If you did not request a password reset, please ignore this email.</p>
            </div>
          \`
        });
      } catch (e) {
        console.warn("Failed to send reset email", e);
      }
    }

    return { success: true, token: resetToken, message: "Simulated reset email sent." };`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(fp, content);
  console.log("Fixed user.ts to add email sending back");
} else {
  console.log("Target not found");
}
