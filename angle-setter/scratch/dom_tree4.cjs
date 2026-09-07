const fs = require('fs');
let lines = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8').split('\n');

let depth = 0;
for(let i=158; i<=400; i++) {
  let line = lines[i];
  if(line.includes('<div') && !line.includes('/>') && !line.includes('</div')) {
    depth++;
  }
  if(line.includes('</div')) {
    depth--;
  }
}
console.log('Depth after line 400: ' + depth);
