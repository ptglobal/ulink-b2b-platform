const fs = require('fs');
const s = fs.readFileSync('openapi.json', 'utf8');
console.log('len:', s.length);
// Just confirm s.slice(0, 783552) parses and what's at position 783552+
console.log('s.slice(0, 783552) parses?', (() => { try { JSON.parse(s.slice(0, 783552)); return 'YES'; } catch(e) { return 'NO: ' + e.message.slice(0,80); } })());
console.log('chars 783550-783554:');
for (let i = 783550; i < 783554; i++) console.log(' ', i, JSON.stringify(s[i]), '0x' + s.charCodeAt(i).toString(16));
console.log('chars around the tail:');
console.log(JSON.stringify(s.slice(783540, 783554)));
