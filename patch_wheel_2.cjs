const fs = require('fs');
let code = fs.readFileSync('src/components/wheels/WheelManagerView.tsx', 'utf8');

const regexOpenEdit = /const openEditWheelModal = React\.useCallback\([\s\S]*?\}, \[\]\);\n\n/;
code = code.replace(regexOpenEdit, '');

const regexHandleEdit = /React\.useEffect\(\(\) => {\n    const handleEdit = \(e: Event\) => {\n[\s\S]*?\}, \[wheels, openEditWheelModal\]\);\n\n/;
code = code.replace(regexHandleEdit, '');

const regexCloseEdit = /const closeEditWheelModal = \(\) => {\n[\s\S]*?\}, MODAL_CLOSE_MS\);\n  };\n\n/;
code = code.replace(regexCloseEdit, '');

fs.writeFileSync('src/components/wheels/WheelManagerView.tsx', code);
