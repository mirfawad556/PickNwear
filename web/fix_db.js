const fs = require('fs');
const path = require('path');

const files = ['user.ts', 'admin.ts', 'cart.ts', 'order.ts'];

files.forEach(f => {
  const fp = path.join(process.cwd(), 'src', 'app', 'actions', f);
  let content = fs.readFileSync(fp, 'utf8');

  if (content.includes('import { existsSync }')) return;

  const replaceImports = `import fs from 'fs/promises';\nimport { existsSync, copyFileSync } from 'fs';\nimport os from 'os';`;
  content = content.replace("import fs from 'fs/promises';", replaceImports);

  const getPathLogic = `const LOCAL_DB = path.join(process.cwd(), 'local-db.json');
const TMP_DB = path.join(os.tmpdir(), 'local-db.json');

function getDBPath() {
  if (process.env.VERCEL === '1') {
    if (!existsSync(TMP_DB) && existsSync(LOCAL_DB)) {
      copyFileSync(LOCAL_DB, TMP_DB);
    }
    return TMP_DB;
  }
  return LOCAL_DB;
}`;

  content = content.replace("const DB_PATH = path.join(process.cwd(), 'local-db.json');", getPathLogic);
  content = content.replace(/DB_PATH/g, 'getDBPath()');
  
  fs.writeFileSync(fp, content);
});
