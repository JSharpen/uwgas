const fs = require('fs');
let code = fs.readFileSync('src/components/ProgressionView.tsx', 'utf8');

const oldLogic = `          if (Math.abs(diff) >= 0.01) {
            deltaText = \\\`Δ \${diff > 0 ? '+' : ''}\${diff.toFixed(2)} MM\\\`;
          }`;

const newLogic = `          if (Math.abs(diff) >= 0.01) {
            // Assume 1.5mm pitch (Tormek standard M12) with 6 notches (hex nut)
            const totalNotches = Math.round(Math.abs(diff) / (1.5 / 6));
            const turns = Math.floor(totalNotches / 6);
            const notches = totalNotches % 6;
            const turnText = (turns > 0 || notches > 0) ? \` (\${diff > 0 ? '↑' : '↓'} \${turns}T \${notches}N)\` : '';
            deltaText = \`Δ \${diff > 0 ? '+' : ''}\${diff.toFixed(2)} MM\${turnText}\`;
          }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/ProgressionView.tsx', code);
