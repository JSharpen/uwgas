import re

with open('src/components/layout/ContextBar.tsx', 'r') as f:
    content = f.read()

# Add useDevStore to ContextBar
if 'useDevStore' not in content:
    content = content.replace("import { useUIStore } from '../../state/uiStore';", "import { useUIStore } from '../../state/uiStore';\nimport { useDevStore } from '../../state/devStore';")

if 'const maskTopFade =' not in content:
    content = content.replace("  const selectedPresetId =", "  const maskTopFade = useDevStore((s) => s.maskTopFade);\n  const selectedPresetId =")

# Add shadow to non-confirmation header
old_header = """    <header ref={headerRef} className="sticky top-3 sm:top-4 z-50 flex items-center justify-between mb-4 px-2 py-2 bg-[#1a1510]/90 backdrop-blur-2xl border border-amber-500/30 shadow-[0_8px_32px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20 rounded-3xl transition-all duration-300 min-h-[60px] mx-auto max-w-[576px] w-full relative">"""
new_header = """    <header ref={headerRef} className="sticky top-3 sm:top-4 z-50 flex items-center justify-between mb-4 px-2 py-2 bg-[#1a1510]/90 backdrop-blur-2xl border border-amber-500/30 shadow-[0_8px_32px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20 rounded-3xl transition-all duration-300 min-h-[60px] mx-auto max-w-[576px] w-full relative">
      {maskTopFade > 0 && (
        <div 
          className="absolute inset-x-0 top-[-200px] pointer-events-none -z-10 bg-gradient-to-b from-[#09090b] via-[#09090b] to-transparent rounded-[inherit]"
          style={{ bottom: `-${maskTopFade}px` }}
        />
      )}"""
content = content.replace(old_header, new_header)

with open('src/components/layout/ContextBar.tsx', 'w') as f:
    f.write(content)


with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content2 = f.read()

old_button = """            {/* === SUMMARY PILL (Front Layer, Static) === */}
          <button """
new_button = """            {/* === SUMMARY PILL (Front Layer, Static) === */}
          <div className="relative w-full shrink-0">
            {maskBottomFade > 0 && (
              <div 
                className="absolute inset-x-0 bottom-[-200px] pointer-events-none -z-10 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent rounded-3xl"
                style={{ top: `-${maskBottomFade}px` }}
              />
            )}
            <button """
content2 = content2.replace(old_button, new_button)

old_end = """            {/* Right Action: Global Run / Sync */}
            <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 flex items-center z-20">
              <div className="w-10 h-10 rounded-full neu-convex flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition-colors shadow-inner">
                <IconChevronRight className="w-6 h-6 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}"""
new_end = """            {/* Right Action: Global Run / Sync */}
            <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 flex items-center z-20">
              <div className="w-10 h-10 rounded-full neu-convex flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition-colors shadow-inner">
                <IconChevronRight className="w-6 h-6 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>
          </div>
        </div>
      </div>
    </>
  );
}"""
content2 = content2.replace(old_end, new_end)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content2)

print("Shadows added")
