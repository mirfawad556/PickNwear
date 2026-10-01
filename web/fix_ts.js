const fs = require('fs');
const path = require('path');

// Fix admin/page.tsx
const adminPagePath = path.join(process.cwd(), 'src', 'app', 'admin', 'page.tsx');
if (fs.existsSync(adminPagePath)) {
  let content = fs.readFileSync(adminPagePath, 'utf8');
  content = content.replace('setProducts(res.products);', 'setProducts(res.products || []);');
  content = content.replace('setUsers(res.users);', 'setUsers(res.users || []);');
  fs.writeFileSync(adminPagePath, content);
}

// Fix CollectionClient.tsx
const collClientPath = path.join(process.cwd(), 'src', 'components', 'CollectionClient.tsx');
if (fs.existsSync(collClientPath)) {
  let content = fs.readFileSync(collClientPath, 'utf8');
  content = content.replace('setProducts(res.products);', 'setProducts(res.products || []);');
  fs.writeFileSync(collClientPath, content);
}

// Fix AuthContext.tsx
const authCtxPath = path.join(process.cwd(), 'src', 'context', 'AuthContext.tsx');
if (fs.existsSync(authCtxPath)) {
  let content = fs.readFileSync(authCtxPath, 'utf8');
  content = content.replace('type User = { id: string; name: string; email: string; address?: string };', 'type User = { id: string; name: string | null; email: string; address?: string | null };');
  fs.writeFileSync(authCtxPath, content);
}

console.log("Fixed types");
