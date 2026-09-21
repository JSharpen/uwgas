const fs = require('fs');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add imports if not present
  if (!content.includes('TextInput')) {
    content = content.replace(/(import .*?;?\n)/, '$1import { TextInput } from "../ui/TextInput";\nimport { NumberInput } from "../ui/NumberInput";\nimport { SwitchButton } from "../ui/SwitchButton";\n');
  }

  // Replace TextInputs
  // Pattern: <label...><span...>{label}</span><input type="text"... {props}/></label>
  content = content.replace(
    /<label className="flex flex-col gap-1\.5[^>]*">\s*<span className="text-\[10px\][^>]*>([^<]+)<\/span>\s*<input\s+type="text"\s+className="neu-concave[^"]*"(.*?)\/>\s*<\/label>/gs,
    (match, labelText, propsStr) => {
      // Fix autoFocus which might be just autoFocus
      let fixedProps = propsStr.trim();
      return `<TextInput\n  label="${labelText}"\n  ${fixedProps}\n/>`;
    }
  );

  // Replace NumberInputs
  content = content.replace(
    /<label className="flex flex-col gap-1\.5[^>]*">\s*<span className="text-\[10px\][^>]*>([^<]+)<\/span>\s*<input\s+type="number"\s+[^>]*?className="neu-concave[^"]*"(.*?)\/>\s*<\/label>/gs,
    (match, labelText, propsStr) => {
      let fixedProps = propsStr.trim();
      return `<NumberInput\n  label="${labelText}"\n  ${fixedProps}\n/>`;
    }
  );

  // Replace SwitchButtons
  content = content.replace(
    /<button\s+type="button"\s+role="switch"\s+aria-checked=\{([^}]+)\}\s+className=\{`flex items-center justify-between w-full p-3\.5 neu-button[^`]*`\}\s+onClick=\{([^>]+)\}\s*>\s*<div className="flex flex-col items-start min-w-0">\s*<span className=\{`text-sm font-bold [^`]*`\}>([^<]+)<\/span>\s*(?:<span className="text-\[10px\] text-white\/40 font-mono mt-0\.5 truncate max-w-\[200px\] sm:max-w-none">\s*([^<]+)\s*<\/span>\s*)?<\/div>\s*\{[^}]+\}\s*<\/button>/gs,
    (match, checkedExpr, onClickExpr, titleText, subtitleText) => {
      // Handle the onChange. onClick might be an arrow function onClick={() => ...} or just an updater function
      let onChangeProp = `onChange={() => ${onClickExpr.replace(/^\(\)\s*=>\s*/, '')}}`;
      if (onClickExpr.startsWith('{')) {
          onChangeProp = `onChange={${onClickExpr.slice(1, -1).replace(/^\(\)\s*=>\s*/, '')}}`; // Strip onClick braces and arrow if present? Wait.
      }
      
      // Let's just do a simpler replacement for SwitchButtons manually if regex is too complex
      return `/* TODO SWITCH */`;
    }
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed ${filePath}`);
}

processFile('src/components/settings/MachineManagerView.tsx');
processFile('src/components/settings/JigManagerView.tsx');
processFile('src/components/settings/UsbManagerView.tsx');
