const fs = require('fs');
const code = fs.readFileSync('scratch/inputs_area.txt', 'utf8');

let divDepth = 0;
let lines = code.split('\n');

lines.forEach(line => {
  // Count `<div` that are not `/>` self-closing
  let opens = (line.match(/<div(?!\w)/g) || []).length;
  let selfClosing = (line.match(/<div[^>]*\/>/g) || []).length;
  let closes = (line.match(/<\/div>/g) || []).length;
  
  let netOpens = opens - selfClosing;
  
  if (netOpens > 0 || closes > 0) {
    divDepth += netOpens;
    divDepth -= closes;
    console.log(`Line: ${line.trim()} | Depth: ${divDepth}`);
  }
});
