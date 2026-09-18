const fs = require('fs');
let code = fs.readFileSync('src/components/layout/ContextBar.tsx', 'utf8');

const regex = /<motion\.div\n\s*key=\{stateKey\}\n\s*initial=\{\{ opacity: 0, filter: 'blur\(10px\)', scale: 0\.95 \}\}\n\s*animate=\{\{ opacity: 1, filter: 'blur\(0px\)', scale: 1 \}\}\n\s*exit=\{\{ opacity: 0, filter: 'blur\(10px\)', scale: 1\.05 \}\}\n\s*transition=\{\{ duration: 0\.4, ease: \[0\.33, 1, 0\.68, 1\] \}\}/;

const replacement = `<motion.div
            key={stateKey}
            initial={{ opacity: 0, filter: 'blur(2px)', scale: 0.98 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(2px)', scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}`;

if(code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/layout/ContextBar.tsx', code);
    console.log("Updated to fast, subtle liquid animation!");
} else {
    console.log("Could not find the regex. Here's what's there:");
    console.log(code.substring(code.indexOf('<motion.div'), code.indexOf('<motion.div') + 300));
}
