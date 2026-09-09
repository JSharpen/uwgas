const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetSectionStart = '{/* Progression Section */}';
const targetSectionEnd = '</section>';

const startIndex = code.indexOf(targetSectionStart);
// Find the closing </section> of the Progression section.
let endIndex = code.indexOf(targetSectionEnd, startIndex);

const newSection = `{/* Progression Section */}
          <section className="panel-card panel-card--allow-overflow motion-panel flex flex-col gap-0 max-w-xl">
            <div
              className="panel-card__header flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold u-text panel-header">Progression</h2>
              </div>
              
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  className={\`\${BTN.base} px-3 text-xs text-danger hover:bg-danger/10 border-danger/20\`}
                  onClick={() => setSessionSteps([])}
                  disabled={sessionSteps.length === 0}
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="panel-card__body flex flex-col gap-3">
              <div className="mt-1">
                {sessionSteps.length === 0 ? (
                  <div className="text-xs text-neutral-400 border border-dashed u-border rounded p-4 flex flex-col gap-3 items-center text-center">
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
                  </div>
                ) : (
                  <ProgressionView
                    wheelResults={wheelResults}
                    machines={machines}
                    defaultMachineId={defaultMachineId}
                    usbs={usbs}
                    wheels={wheels}
                    globalUsbId={global.activeUsbId}
                    heightMode={heightMode}
                    calcMode={global.calcMode}
                    angleSymbol={effectiveAngleSymbol}
                    cardMinHeight={112}
                    onUpdateStep={(id, patch) =>
                      setSessionSteps(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
                    }
                    onDeleteStep={id => setSessionSteps(prev => prev.filter(s => s.id !== id))}
                    onMoveStep={(index, direction) => {
                      const newSteps = [...sessionSteps];
                      if (index + direction >= 0 && index + direction < newSteps.length) {
                        const temp = newSteps[index];
                        newSteps[index] = newSteps[index + direction];
                        newSteps[index + direction] = temp;
                        setSessionSteps(newSteps);
                      }
                    }}
                    onAddStep={handleAddStep}
                  />
                )}
              </div>
            </div>
          </section>`;

code = code.substring(0, startIndex) + newSection + code.substring(endIndex + targetSectionEnd.length);
fs.writeFileSync('src/App.tsx', code);
