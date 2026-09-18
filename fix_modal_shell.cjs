const fs = require('fs');
let code = fs.readFileSync('src/components/ModalShell.tsx', 'utf8');

// Remove manual popstate logic
const popstateRegex = /\/\/ Handle swipe-back \(popstate\)[\s\S]*?\}, \[closing, onClose\]\);/;
code = code.replace(popstateRegex, "");

// Remove isPopping logic
code = code.replace("let isPopping = false;\n\n", "");

fs.writeFileSync('src/components/ModalShell.tsx', code);
console.log("Removed manual popstate logic from ModalShell!");
