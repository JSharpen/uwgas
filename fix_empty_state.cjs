const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldEmpty = `<div className="text-xs text-neutral-400 border border-dashed u-border rounded p-4 flex flex-col gap-3 items-center text-center">
                    <p>No sharpening steps defined yet.</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={BTN.primary}
                        onClick={handleLoadDefaultProgression}
                      >
                        + Load Standard Progression
                      </button>
                      <button
                        type="button"
                        className={BTN.base}
                        onClick={handleAddStep}
                      >
                        + Add Step
                      </button>
                    </div>
                  </div>`;

const newEmpty = `<div className="text-sm text-white/40 border border-dashed border-white/10 rounded-3xl p-8 flex flex-col gap-4 items-center text-center">
                    <p>No sharpening steps defined yet.</p>
                    <div className="flex flex-col w-full gap-3 mt-2">
                      <button
                        type="button"
                        className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-2xl transition"
                        onClick={handleLoadDefaultProgression}
                      >
                        Load Standard Progression
                      </button>
                      <button
                        type="button"
                        className="w-full border border-white/10 hover:bg-white/5 text-white/60 font-bold py-3 px-4 rounded-2xl transition"
                        onClick={handleAddStep}
                      >
                        Add Blank Step
                      </button>
                    </div>
                  </div>`;

code = code.replace(oldEmpty, newEmpty);
fs.writeFileSync('src/App.tsx', code);
