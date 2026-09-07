const fs = require('fs');
let lines = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8').split('\n');

let depth = 0;
for(let i=159; i<lines.length; i++) {
  if (lines[i].includes('<div')) depth++;
  if (lines[i].includes('</div')) depth--;
  if (depth === 0) {
    console.log("Closes on line: " + (i + 1));
    break;
  }
}
