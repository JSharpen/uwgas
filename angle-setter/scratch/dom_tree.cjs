const fs = require('fs');
let lines = fs.readFileSync('src/components/calculator/GlobalSetupCard.tsx', 'utf8').split('\n');
let depth = 0;
for(let i=0; i<lines.length; i++) {
  let line = lines[i];
  if(line.includes('<div') && !line.includes('/>') && !line.includes('</div')) {
    depth++;
    if(line.includes('DRAWER BODY')) console.log(i + ': ' + ' '.repeat(depth) + 'Drawer Body opened');
    if(line.includes('INPUTS AREA')) console.log(i + ': ' + ' '.repeat(depth) + 'Inputs Area opened');
  }
  if(line.includes('</div')) {
    if(i === 399) console.log(i + ': ' + ' '.repeat(depth) + 'Line 400 </div>');
    depth--;
  }
  if(line.includes('SUMMARY PILL')) console.log(i + ': ' + ' '.repeat(depth) + 'SUMMARY PILL');
}
