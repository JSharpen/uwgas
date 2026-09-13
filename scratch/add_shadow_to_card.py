import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

old_imports = """import { useStore } from '../../state/store';
import { useUIStore } from '../../state/uiStore';"""
new_imports = """import { useStore } from '../../state/store';
import { useUIStore } from '../../state/uiStore';
import { useDevStore } from '../../state/devStore';"""
content = content.replace(old_imports, new_imports)

old_hook = """export function GlobalSetupCard() {
  // Store subscriptions using atomic selectors"""
new_hook = """export function GlobalSetupCard() {
  const maskBottomFade = useDevStore(state => state.maskBottomFade);
  // Store subscriptions using atomic selectors"""
content = content.replace(old_hook, new_hook)

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
content = content.replace(old_button, new_button)

old_button_end = """            <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 flex items-center z-20">
              <div className="w-10 h-10 rounded-full neu-convex flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition-colors shadow-inner">
                <IconChevronRight className="w-6 h-6 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Preset Action Sheet */}"""

new_button_end = """            <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 flex items-center z-20">
              <div className="w-10 h-10 rounded-full neu-convex flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition-colors shadow-inner">
                <IconChevronRight className="w-6 h-6 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>
          </div>
        </div>
      </div>

      {/* Preset Action Sheet */}"""
content = content.replace(old_button_end, new_button_end)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Shadow added to GlobalSetupCard")
