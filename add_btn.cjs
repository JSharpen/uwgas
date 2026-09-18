const fs = require('fs');
let code = fs.readFileSync('src/components/settings/DevStateView.tsx', 'utf8');

const nukeBlock = `<div className="flex flex-col gap-4 border-t border-white/5 pt-6">
          <button
            type="button"
            onClick={handleNukeState}`;

const newButtonBlock = `<div className="flex flex-col gap-4 border-t border-white/5 pt-6">
          <button
            type="button"
            onClick={handleInjectDummyMappingData}
            className="flex items-center justify-center p-3 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 active:bg-amber-400/30 text-amber-400 font-semibold border border-amber-400/20 transition-colors"
          >
            Inject Machine Mappings
          </button>
          <p className="text-xs text-white/40 -mt-2">Injects 2 dummy geometry mappings into the first machine.</p>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
          <button
            type="button"
            onClick={handleNukeState}`;

code = code.replace(nukeBlock, newButtonBlock);
fs.writeFileSync('src/components/settings/DevStateView.tsx', code);
