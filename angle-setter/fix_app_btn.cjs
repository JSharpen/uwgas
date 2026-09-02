const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldBtn = `<button
                    type="button"
                    className="mt-2 w-full border border-dashed border-neutral-700 rounded-xl p-4 text-neutral-400 font-bold text-sm hover:bg-neutral-800/50 hover:border-neutral-500 transition-colors"
                    onClick={handleAddStep}
                  >
                    + Add Wheel Step
                  </button>`;

const newBtn = `<button
                    type="button"
                    className="mt-2 w-full border border-dashed border-white/10 rounded-3xl p-5 flex items-center justify-center gap-2 text-white/40 font-bold text-sm hover:bg-white/5 hover:border-white/20 hover:text-white/60 transition-all"
                    onClick={handleAddStep}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Wheel Step
                  </button>`;

code = code.replace(oldBtn, newBtn);
fs.writeFileSync('src/App.tsx', code);
