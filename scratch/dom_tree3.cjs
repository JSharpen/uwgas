const fs = require('fs');
let lines = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8').split('\n');
let depth = 0;
for(let i=395; i<lines.length; i++) {
  let line = lines[i];
  if(line.includes('<div') && !line.includes('/>') && !line.includes('</div')) {
    depth++;
    console.log(i + ': <div (depth ' + depth + ')');
  }
  if(line.includes('</div')) {
    console.log(i + ': </div (depth ' + depth + ')');
    depth--;
  }
}
