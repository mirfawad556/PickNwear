const fs = require('fs');
const path = require('path');

const fp = path.join(process.cwd(), 'src', 'app', 'actions', 'admin.ts');
let content = fs.readFileSync(fp, 'utf8');

// For addProduct
const targetAdd = `    if (imageUrl && imageUrl.startsWith('data:image')) {
      const matches = imageUrl.match(/^data:image\\/([A-Za-z-+\\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = \`product-\${Date.now()}.\${ext}\`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, filename), buffer);
        imageUrl = \`/uploads/\${filename}\`;
      }
    }`;
const replacementAdd = `    // Store base64 string directly in Supabase to avoid Vercel read-only errors
    if (imageUrl && imageUrl.startsWith('data:image')) {
      imageUrl = productData.image; 
    }`;

// For updateProduct
const targetUpdate = `    if (imageUrl && imageUrl.startsWith('data:image')) {
      const matches = imageUrl.match(/^data:image\\/([A-Za-z-+\\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = \`product-\${Date.now()}.\${ext}\`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, filename), buffer);
        imageUrl = \`/uploads/\${filename}\`;
      }
    }`;
const replacementUpdate = `    // Store base64 string directly in Supabase to avoid Vercel read-only errors
    if (imageUrl && imageUrl.startsWith('data:image')) {
      imageUrl = productData.image;
    }`;

if (content.includes("const uploadDir")) {
  content = content.replace(targetAdd, replacementAdd);
  content = content.replace(targetUpdate, replacementUpdate);
  fs.writeFileSync(fp, content);
  console.log("Fixed admin.ts image logic");
} else {
  console.log("Not found");
}
