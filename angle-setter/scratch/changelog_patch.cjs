const fs = require('fs');
let content = fs.readFileSync('docs/CHANGELOG.md', 'utf8');

const newEntry = `## [0.9.10] — 2026-09-07 (Session: Safari Layout & Padding Fixes)

### 🐛 Bug Fixes & UI Polish
- **Safari Scroll Padding Fix**: Resolved layout issues in the Global Setup Card drawer where content was abruptly cut off by the Summary Pill overlapping the scroll area.
- **Flex Gap Math Alignment**: Implemented a dynamic \`h-px\` spacer at the precise bottom of the \`Inputs Area\` flex container to perfectly balance the 16px \`gap-4\` padding requirement, providing pixel-perfect bottom clearance without relying on unreliable CSS padding that mobile Safari ignores.
- **Drawer Overlap Geometry**: Verified DOM tree geometry to ensure the \`Drawer Body\` successfully wraps the inner scroll area and gracefully slides behind the overlapping \`Summary Pill\` without structural leakage.

`;

content = content.replace('## [0.9.9]', newEntry + '## [0.9.9]');

fs.writeFileSync('docs/CHANGELOG.md', content);
