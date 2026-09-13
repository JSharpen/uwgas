import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

# Remove the fade overlay block
old_overlay = """        <div id="global-setup-card" className="relative w-full pointer-events-none">
          {/* === FADE OVERLAY (Scroll Mask Illusion) === */}
          {maskBottomFade > 0 && (
            <div 
              className="absolute -left-3 -right-3 sm:left-0 sm:right-0 pointer-events-none z-[-1]"
              style={{ 
                top: `calc(-1 * ${maskBottomFade}px)`,
                bottom: 'calc(-1 * var(--pill-bottom, 72px))',
                background: `linear-gradient(to top, #09090b 0%, #09090b calc(100% - ${maskBottomFade}px), transparent 100%)`
              }}
            />
          )}

          {/* === DRAWER WRAPPER (Overflow hidden for slide animation) === */}"""

new_overlay = """        <div id="global-setup-card" className="relative w-full pointer-events-none">
          {/* === DRAWER WRAPPER (Overflow hidden for slide animation) === */}"""

content = content.replace(old_overlay, new_overlay)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Overlay removed")
