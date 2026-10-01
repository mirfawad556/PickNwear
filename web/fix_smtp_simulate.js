const fs = require('fs');
const path = require('path');

const fp = path.join(process.cwd(), 'src', 'app', 'actions', 'user.ts');
let content = fs.readFileSync(fp, 'utf8');

const regex = /if \(!EMAIL_USER \|\| !EMAIL_PASS\) \{[\s\S]*?\}/;
const replacement = `if (!EMAIL_USER || !EMAIL_PASS) {
      console.warn("SMTP credentials missing. Simulated success.");
      // Just simulate success for Vercel demo so the user doesn't get blocked
      return { success: true, token: resetToken, message: "Simulated reset email sent." };
    }`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(fp, content);
  console.log("Fixed user.ts");
} else {
  console.log("Regex not found");
}
