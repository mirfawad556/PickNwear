const fs = require('fs');
const path = require('path');

const fp = path.join(process.cwd(), 'src', 'app', 'actions', 'user.ts');
let content = fs.readFileSync(fp, 'utf8');

const target = `    if (!EMAIL_USER || !EMAIL_PASS) {
      throw new Error("SMTP credentials missing. Please add EMAIL_USER and EMAIL_APP_PASSWORD to your .env file in the root of the web folder.");
    }`;

const replacement = `    if (!EMAIL_USER || !EMAIL_PASS) {
      console.warn("SMTP credentials missing.");
      return { success: false, message: "Email service is not configured on this server yet. (SMTP credentials missing)" };
    }`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(fp, content);
  console.log("Fixed");
} else {
  console.log("Target not found");
}
