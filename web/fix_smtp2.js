const fs = require('fs');
const path = require('path');

const fp = path.join(process.cwd(), 'src', 'app', 'actions', 'user.ts');
let content = fs.readFileSync(fp, 'utf8');

const regex = /if \(!EMAIL_USER \|\| !EMAIL_PASS\) \{[\s\S]*?\}/;

const replacement = `if (!EMAIL_USER || !EMAIL_PASS) {
      console.warn("SMTP credentials missing.");
      return { success: false, message: "Email service is not configured on this server yet. (SMTP credentials missing)" };
    }`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(fp, content);
  console.log("Fixed");
} else {
  console.log("Regex not found");
}
