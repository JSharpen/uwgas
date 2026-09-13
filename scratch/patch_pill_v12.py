import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

old_code = """    };
  }, []);
  
  const effectiveConsts = constants ?? DEFAULT_CONSTANTS;"""

new_code = """    };
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
  
  const effectiveConsts = constants ?? DEFAULT_CONSTANTS;"""

content = content.replace(old_code, new_code)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Click outside patched properly!")
