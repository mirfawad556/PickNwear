const fs = require('fs');
const path = require('path');

const adminPagePath = path.join(process.cwd(), 'src', 'app', 'admin', 'page.tsx');
if (fs.existsSync(adminPagePath)) {
  let content = fs.readFileSync(adminPagePath, 'utf8');
  content = content.replace(/setProducts\(res\.products\);/g, 'setProducts(res.products || []);');
  content = content.replace(/setUsers\(res\.users\);/g, 'setUsers(res.users || []);');
  fs.writeFileSync(adminPagePath, content);
}

const collClientPath = path.join(process.cwd(), 'src', 'components', 'CollectionClient.tsx');
if (fs.existsSync(collClientPath)) {
  let content = fs.readFileSync(collClientPath, 'utf8');
  content = content.replace(/setProducts\(res\.products\);/g, 'setProducts(res.products || []);');
  fs.writeFileSync(collClientPath, content);
}

const headerPath = path.join(process.cwd(), 'src', 'components', 'Header.tsx');
if (fs.existsSync(headerPath)) {
  let content = fs.readFileSync(headerPath, 'utf8');
  content = content.replace(/user\.name\[0\]/g, '(user.name || "U")[0]');
  fs.writeFileSync(headerPath, content);
}

console.log("Fixed types 2");
