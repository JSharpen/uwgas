const fs = require('fs');
let code = fs.readFileSync('src/components/ProgressionView.tsx', 'utf8');

const hookCode = `  const [sheetConfig, setSheetConfig] = React.useState<{ type: 'wheel' | 'machine' | 'usb'; stepId: string } | null>(null);

  React.useEffect(() => {
    const handleCollapseAll = () => setExpandedStepId(null);
    window.addEventListener('collapseAll', handleCollapseAll);
    return () => window.removeEventListener('collapseAll', handleCollapseAll);
  }, []);

  const isProjectionMode = calcMode === 'projection';`;

code = code.replace("  const [sheetConfig, setSheetConfig] = React.useState<{ type: 'wheel' | 'machine' | 'usb'; stepId: string } | null>(null);\n  const isProjectionMode = calcMode === 'projection';", hookCode);

fs.writeFileSync('src/components/ProgressionView.tsx', code);
