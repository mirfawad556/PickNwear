const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'local-db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

let modified = false;

db.products.forEach(p => {
  if (p.image && p.image.startsWith('data:image')) {
    const matches = p.image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = 'product-' + p.id + '.' + ext;
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      p.image = '/uploads/' + filename;
      modified = true;
    }
  }
});

if (modified) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log('Database migrated successfully');
} else {
  console.log('No migration needed');
}
