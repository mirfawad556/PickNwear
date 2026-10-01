const fs = require('fs');
const path = require('path');

const fp = path.join(process.cwd(), 'src', 'components', 'AuthModal.tsx');
let content = fs.readFileSync(fp, 'utf8');

const target = `if (!isAuthModalOpen) return null;`;
const replacement = `
  React.useEffect(() => {
    if (!isAuthModalOpen) {
      setError("");
      setSuccess("");
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(fp, content);
  console.log("Fixed AuthModal");
} else {
  console.log("Target not found");
}
