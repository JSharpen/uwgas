const fs = require('fs');
let code = fs.readFileSync('src/components/layout/ContextBar.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  "import { PresetMenuPopover } from '../presets/PresetMenuPopover';",
  "import { PresetMenuPopover } from '../presets/PresetMenuPopover';\nimport { motion, AnimatePresence } from 'framer-motion';"
);

// 2. Add stateKey before `return`
const returnRegex = /  return \(\n    <>\n      \{\/\* Invisible spacer/;
const stateKeyDef = `  const stateKey = confirmation 
    ? 'confirm' 
    : [
        view,
        settingsView,
        equipmentTab,
        calibratingMachineId,
        expandedEquipmentId,
        expandedStepId,
        expandedPresetId,
        isPresetMenuOpen,
        sessionSteps.length === 0
      ].join('|');

  return (
    <>
      {/* Invisible spacer`;

code = code.replace(returnRegex, stateKeyDef);

// 3. Replace the slot rendering block
const renderRegex = /      \{leftSlot\}\n      \{centerSlot\}\n      \{rightSlot\}/;
const renderReplacement = `      <div className="flex-1 flex justify-start min-w-[80px] relative">
        <AnimatePresence mode="popLayout" initial={false}>
          {leftSlot && (
            <motion.div
              key={stateKey + '-left'}
              initial={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="w-full flex justify-start"
            >
              {leftSlot}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-shrink flex items-center justify-center relative min-w-0">
        <AnimatePresence mode="popLayout" initial={false}>
          {centerSlot && (
            <motion.div
              key={stateKey + '-center'}
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(2px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(2px)' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="w-full flex justify-center"
            >
              {centerSlot}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 flex justify-end min-w-[80px] relative">
        <AnimatePresence mode="popLayout" initial={false}>
          {rightSlot && (
            <motion.div
              key={stateKey + '-right'}
              initial={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="w-full flex justify-end"
            >
              {rightSlot}
            </motion.div>
          )}
        </AnimatePresence>
      </div>`;

code = code.replace(renderRegex, renderReplacement);

fs.writeFileSync('src/components/layout/ContextBar.tsx', code);
console.log("Patched ContextBar with Framer Motion!");
