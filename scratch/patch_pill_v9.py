import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

# I need to add kbOffset state
state_block = """  const [activeInlineRow, setActiveInlineRow] = React.useState<'none' | 'angle' | 'projection'>('none');
  const [activeModal, setActiveModal] = React.useState<'none' | 'angle' | 'projection'>('none');"""

new_state_block = """  const [activeInlineRow, setActiveInlineRow] = React.useState<'none' | 'angle' | 'projection'>('none');
  const [activeModal, setActiveModal] = React.useState<'none' | 'angle' | 'projection'>('none');
  
  const [kbOffset, setKbOffset] = React.useState(0);
  React.useEffect(() => {
    if (!window.visualViewport) return;
    const handler = () => {
      // Visual viewport height shrinks when keyboard opens on some mobile browsers.
      // But iOS Safari might also scroll the window.
      // A simple way is to take window.innerHeight - visualViewport.height
      // However, if it's installed as a PWA, env(safe-area-inset-bottom) might also play a role.
      // Let's just calculate the difference:
      const vv = window.visualViewport;
      if (!vv) return;
      const offset = window.innerHeight - vv.height;
      setKbOffset(Math.max(0, offset));
    };
    window.visualViewport.addEventListener('resize', handler);
    window.visualViewport.addEventListener('scroll', handler);
    // Initial check
    handler();
    return () => {
      window.visualViewport?.removeEventListener('resize', handler);
      window.visualViewport?.removeEventListener('scroll', handler);
    };
  }, []);"""

content = content.replace(state_block, new_state_block)

# Replace the style on the main wrapper
old_style = """      <div 
        className="fixed left-3 right-3 sm:left-auto sm:right-auto sm:w-[576px] z-30 mx-auto pointer-events-none flex flex-col justify-end transition-all duration-300"
        style={{ bottom: 'var(--pill-bottom, 72px)' }}
      >"""

new_style = """      <div 
        className="fixed left-3 right-3 sm:left-auto sm:right-auto sm:w-[576px] z-30 mx-auto pointer-events-none flex flex-col justify-end transition-all duration-300"
        style={{ bottom: `calc(var(--pill-bottom, 72px) + ${kbOffset}px)` }}
      >"""

# Wait, the transition-all might not be there. Let's just find `style={{ bottom: 'var(--pill-bottom, 72px)' }}`
content = content.replace("style={{ bottom: 'var(--pill-bottom, 72px)' }}", "style={{ bottom: `calc(var(--pill-bottom, 72px) + ${kbOffset}px)` }}")

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Keyboard offset added!")
