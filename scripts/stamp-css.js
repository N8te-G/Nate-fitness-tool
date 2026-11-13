// After building vendor/tailwind.css, stamp its content hash into index.html's stylesheet link
// (./vendor/tailwind.css?v=<hash>). A new page then always loads the stylesheet built with it,
// never an older cached copy.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'vendor/tailwind.css'));
const hash = crypto.createHash('sha256').update(css).digest('hex').slice(0, 10);
const htmlPath = path.join(root, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const re = /href="\.\/vendor\/tailwind\.css(\?v=[^"]*)?"/g;
const count = (html.match(re) || []).length;
if (count !== 1) throw new Error(`Expected one tailwind.css link in index.html, found ${count}`);
fs.writeFileSync(htmlPath, html.replace(re, `href="./vendor/tailwind.css?v=${hash}"`));
console.log(`Stamped vendor/tailwind.css?v=${hash}`);
