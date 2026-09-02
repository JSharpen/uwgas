const fs = require('fs');
let code = fs.readFileSync('src/components/ProgressionView.tsx', 'utf8');

// Fix 1: React import
code = code.replace("import type React from 'react';", "import * as React from 'react';");

// Fix 2: Remove Dj references and fix D reference
code = code.replace("meta: \\`D:\\${w.Dj || w.D}mm\\`", "meta: \\`D:\\${w.D}mm\\`");
code = code.replace("placeholder={r.wheel.Dj?.toString() ?? r.wheel.D?.toString()}", "placeholder={r.wheel.D?.toString()}");
code = code.replace("value={r.step.D ?? r.wheel.D ?? ''}", "value={r.step.customD ?? r.wheel.D ?? ''}");
code = code.replace("{ D: isNaN(val) ? undefined : val }", "{ customD: isNaN(val) ? undefined : val }");

// Fix 3: GrindDirToggle
// GrindDirToggle signature: base, isHoning, canToggle, onToggle, showLabel
code = code.replace(
  "onChange={(b) => onUpdateStep(stepId, { base: b })}",
  "isHoning={false}\n                        canToggle={true}\n                        onToggle={() => onUpdateStep(stepId, { base: r.step.base === 'rear' ? 'front' : 'rear' })}"
);

// Fix 4: Machine constants for delta
code = code.replace("const tpi = effectiveMachine?.constants?.threadsPerInch;", "const pitchMm = effectiveMachine?.constants?.pitchMm;");
code = code.replace("if (tpi) {", "if (pitchMm) {");
code = code.replace("const pitchMm = 25.4 / tpi;", "");
code = code.replace("const wheelNutNotches = effectiveMachine?.constants?.wheelNutNotches;", "const wheelNutNotches = effectiveMachine?.constants?.microAdjNotches;");

fs.writeFileSync('src/components/ProgressionView.tsx', code);
