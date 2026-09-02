const fs = require('fs');
let code = fs.readFileSync('src/components/ProgressionView.tsx', 'utf8');

code = code.replace(
  '<div className="flex flex-col card-stack text-xs pb-10">',
  '<div className="flex flex-col card-stack text-xs pb-10" style={{ \'--card-stack-gap\': \'1rem\' } as React.CSSProperties}>'
);

fs.writeFileSync('src/components/ProgressionView.tsx', code);
