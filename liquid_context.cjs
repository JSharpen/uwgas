const fs = require('fs');
let code = fs.readFileSync('src/components/layout/ContextBar.tsx', 'utf8');

const target = `<motion.div
            key={stateKey}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.25 }}`;

const replacement = `<motion.div
            key={stateKey}
            initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
            transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}`; // slightly longer for the blur to be visible

let replaced = false;

// I'll just use a generic regex to be safe
const regex = /<motion\.div\n\s*key=\{stateKey\}[\s\S]*?className="absolute/m;
const newStr = `<motion.div
            key={stateKey}
            initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
            transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
            className="absolute`;

if (code.match(regex)) {
   code = code.replace(regex, newStr);
   fs.writeFileSync('src/components/layout/ContextBar.tsx', code);
   console.log("Updated to liquid animation!");
} else {
   console.log("Still failed.");
}
