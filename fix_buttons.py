import re
with open('src/components/settings/MachineManagerView.tsx', 'r') as f:
    text = f.read()

# Fix Rear Button
text = re.sub(
    r'className="w-full py-2 px-1 rounded-lg bg-black/40 border border-\[var\(--color-accent\)\]/20 text-\[var\(--color-accent\)\] hover:text-\[var\(--color-accent\)\]/80 hover:border-\[var\(--color-accent\)\]/40 transition active:scale-95 flex items-center justify-center gap-1 font-bold text-\[9px\] uppercase tracking-wider cursor-pointer"',
    'className="w-full py-2 px-1 rounded-[calc(var(--ui-radius-core)-12px)] neu-convex border border-white/5 text-[var(--color-accent)] hover:text-white transition active:scale-95 flex items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider cursor-pointer shadow-lg"',
    text
)

# Fix Front Button
text = re.sub(
    r'className="w-full py-2 px-1 rounded-lg bg-black/40 border border-\[var\(--color-focus\)\]/20 text-\[var\(--color-focus\)\] hover:text-\[var\(--color-focus\)\]/80 hover:border-\[var\(--color-focus\)\]/40 transition active:scale-95 flex items-center justify-center gap-1 font-bold text-\[9px\] uppercase tracking-wider cursor-pointer"',
    'className="w-full py-2 px-1 rounded-[calc(var(--ui-radius-core)-12px)] neu-convex border border-white/5 text-[var(--color-focus)] hover:text-white transition active:scale-95 flex items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider cursor-pointer shadow-lg"',
    text
)

with open('src/components/settings/MachineManagerView.tsx', 'w') as f:
    f.write(text)
