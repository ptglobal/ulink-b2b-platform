const fs = require('fs');
const path = require('path');

function walk(dir, cb) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walk(fullPath, cb);
    } else {
      cb(fullPath);
    }
  }
}

let count = 0;
walk(path.join(__dirname, '..', 'src'), (filePath) => {
  if (!/\.(tsx?|ts)$/.test(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('.png')) return;

  // Replace /images/...png with /images/...webp (in both single and double quotes)
  const updated = content.replace(/(\/images\/[^'"]+)\.png/g, '$1.webp');

  if (updated !== content) {
    fs.writeFileSync(filePath, updated);
    count++;
    console.log('Fixed:', path.relative(path.join(__dirname, '..'), filePath));
  }
});

console.log(`\nTotal files fixed: ${count}`);
