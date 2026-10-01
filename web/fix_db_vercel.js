const fs = require('fs');
const path = require('path');

const files = ['user.ts', 'admin.ts', 'cart.ts', 'order.ts'];

files.forEach(f => {
  const fp = path.join(process.cwd(), 'src', 'app', 'actions', f);
  if (!fs.existsSync(fp)) return;
  let content = fs.readFileSync(fp, 'utf8');

  const oldLogic = `function getDBPath() {
  const isVercel = true; // ALWAYS use /tmp on production/Vercel
  if (isVercel) {
    if (!existsSync(TMP_DB) && existsSync(LOCAL_DB)) {
      try { copyFileSync(LOCAL_DB, TMP_DB); } catch(e) {}
    }
    return TMP_DB;
  }
  return LOCAL_DB;
}`;

  const newLogic = `function getDBPath() {
  // Use /tmp only in production (Vercel) to avoid EROFS, keep local-db.json in development
  const isVercel = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  if (isVercel) {
    if (!existsSync(TMP_DB) && existsSync(LOCAL_DB)) {
      try { copyFileSync(LOCAL_DB, TMP_DB); } catch(e) {}
    }
    return TMP_DB;
  }
  return LOCAL_DB;
}`;

  if (content.includes(oldLogic)) {
    content = content.replace(oldLogic, newLogic);
    fs.writeFileSync(fp, content);
    console.log('Fixed', f);
  } else {
    console.log('Did not find old logic in', f);
  }
});
