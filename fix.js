const fs = require('fs');

// Read raw bytes
const buf = fs.readFileSync('index.html');
let html = buf.toString('utf8');

// The file has mojibake: UTF-8 bytes were decoded as latin-1 then re-encoded as UTF-8.
// We need to reverse: take each char, get its char code, treat as latin-1 byte, re-decode as UTF-8.
function fixMojibake(str) {
  try {
    // Convert the string back to latin-1 bytes
    const bytes = Buffer.from(str, 'latin1');
    // Re-decode as UTF-8
    return bytes.toString('utf8');
  } catch(e) {
    return str;
  }
}

// Apply fix to the whole file
html = fixMojibake(html);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Done. Size:', html.length);
