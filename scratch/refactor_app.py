import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Change the main outer container to fixed height and remove pb-[140px]
old_outer = 'className="min-h-dvh bg-[#09090b] text-white px-3 py-3 sm:px-0 sm:py-4 pb-[140px] flex flex-col gap-4 max-w-[576px] mx-auto selection:bg-amber-400/30 selection:text-white"'
new_outer = 'className="h-[100dvh] overflow-hidden bg-[#09090b] text-white pt-3 sm:pt-4 flex flex-col max-w-[576px] mx-auto selection:bg-amber-400/30 selection:text-white"'
content = content.replace(old_outer, new_outer)

# Make ContextBar sit within the outer container but add px padding since we removed it from outer container
# Wait, ContextBar has its own px-2. But we need px-3 sm:px-0 on it?
# Let's check ContextBar.tsx later.
# For now, let's wrap ContextBar in a div that applies the padding if needed, or just let ContextBar handle its own width (which it does via max-w-[576px] w-full).

# Refactor the main tag to be scrollable and masked
old_main = '<main className="flex-1 w-full">'
new_main = '''<main 
        className="flex-1 w-full overflow-y-auto overscroll-y-contain px-3 sm:px-0 pb-[160px] relative z-0"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 16px, black calc(100% - 100px), transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 16px, black calc(100% - 100px), transparent)' }}
      >'''
content = content.replace(old_main, new_main)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("App.tsx refactored to fixed height with masked scrolling main")
