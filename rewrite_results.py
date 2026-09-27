import re

with open('src/components/CalibrationWizard.tsx', 'r') as f:
    content = f.read()

improvement_banner = """
          {/* Potential Improvement Banner */}
          {(() => {
            const worstError = Math.max(rearResult?.angleErrorDeg ?? 0, frontResult?.angleErrorDeg ?? 0);
            if (worstError > 0.015) {
              const diff = worstError - 0.015;
              return (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-[var(--ui-radius-core)] p-4 flex gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                  <span className="text-xl leading-none">💡</span>
                  <div className="flex flex-col gap-1">
                    <strong className="text-sm text-amber-400 font-bold tracking-tight">Precision Check</strong>
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      Your mapping has a {worstError.toFixed(3)}° worst-case error. The mathematical limit for your calipers is ≈ 0.015°, meaning you have <strong>{diff.toFixed(3)}° of potential improvement</strong> left.
                      You can save this best-effort result now, and run a fresh calibration later to perfect it.
                    </p>
                  </div>
                </div>
              );
            }
            return (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-[var(--ui-radius-core)] p-4 flex gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="text-xl leading-none">🏆</span>
                <div className="flex flex-col gap-1">
                  <strong className="text-sm text-emerald-400 font-bold tracking-tight">Caliper Limit Reached</strong>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    Your mapping error is {(worstError || 0).toFixed(3)}°, which is at or below the theoretical limit of your calipers. Flawless mapping achieved!
                  </p>
                </div>
              </div>
            );
          })()}
"""

# Insert right after the outlier warning
content = re.sub(r'(<p className="text-xs text-red-300/80 leading-relaxed">.*?</div>\n            </div>\n          \)}).*?(?=<!-- Rear Base Result Card -->|{\/\* Rear Base Result Card \*\/})', r'\1\n' + improvement_banner + '\n', content, flags=re.DOTALL)

with open('src/components/CalibrationWizard.tsx', 'w') as f:
    f.write(content)
