import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

# Add ref and click outside listener
# We'll put it right after the useEffect for kbOffset
old_code = """      setKbOffset(Math.max(0, offset));
    };
    window.visualViewport.addEventListener('resize', handler);
    window.visualViewport.addEventListener('scroll', handler);
    // Initial check
    handler();
    return () => {
      window.visualViewport?.removeEventListener('resize', handler);
      window.visualViewport?.removeEventListener('scroll', handler);
    };
  }, []);

  const suggestedFrontUsb = computeSuggestedFrontUsbHeight("""

new_code = """      setKbOffset(Math.max(0, offset));
    };
    window.visualViewport.addEventListener('resize', handler);
    window.visualViewport.addEventListener('scroll', handler);
    // Initial check
    handler();
    return () => {
      window.visualViewport?.removeEventListener('resize', handler);
      window.visualViewport?.removeEventListener('scroll', handler);
    };
  }, []);

  const pillRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (activeInlineRow === 'none') return;
    
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setActiveInlineRow('none');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [activeInlineRow]);

  const suggestedFrontUsb = computeSuggestedFrontUsbHeight("""

content = content.replace(old_code, new_code)

# Add the ref to the outmost pill container wrapper
old_wrapper = """      <div 
        className="fixed left-3 right-3 sm:left-auto sm:right-auto sm:w-[576px] z-30 mx-auto pointer-events-none flex flex-col justify-end transition-all duration-300"
        style={{ bottom: `calc(var(--pill-bottom, 72px) + ${kbOffset}px)` }}
      >"""

new_wrapper = """      <div 
        ref={pillRef}
        className="fixed left-3 right-3 sm:left-auto sm:right-auto sm:w-[576px] z-30 mx-auto pointer-events-none flex flex-col justify-end transition-all duration-300"
        style={{ bottom: `calc(var(--pill-bottom, 72px) + ${kbOffset}px)` }}
      >"""

content = content.replace(old_wrapper, new_wrapper)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Click outside patched!")
