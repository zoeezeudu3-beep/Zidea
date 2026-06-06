const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const regex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let idx = 0;
const bad = [];
let m;
while ((m = regex.exec(content)) !== null) {
  idx += 1;
  const code = m[1];
  try {
    new Function(code);
  } catch (e) {
    bad.push({ index: idx, error: e.message });
  }
}
console.log('scripts', idx, 'bad', bad.length);
if (bad.length) console.log(JSON.stringify(bad, null, 2));
