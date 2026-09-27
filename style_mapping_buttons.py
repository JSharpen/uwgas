with open('src/components/settings/MachineManagerView.tsx', 'r') as f:
    text = f.read()

# Rear Button
old_rear = 'className="w-full py-2 px-1 rounded-lg bg-black/40 border border-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] hover:border-[var(--color-accent)]/40 transition active:scale-95 flex items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider cursor-pointer"'
new_rear = 'className="w-full py-2 px-1 rounded-lg neu-convex border border-black/40 text-[var(--color-accent)] hover:text-white transition active:scale-95 flex items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider cursor-pointer shadow-lg"'
text = text.replace(old_rear, new_rear)

# Front Button
old_front = 'className="w-full py-2 px-1 rounded-lg bg-black/40 border border-[var(--color-focus)]/20 text-[var(--color-focus)] hover:bg-[color-mix(in_srgb,var(--color-focus)_10%,transparent)] hover:border-[var(--color-focus)]/40 transition active:scale-95 flex items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider cursor-pointer"'
new_front = 'className="w-full py-2 px-1 rounded-lg neu-convex border border-black/40 text-[var(--color-focus)] hover:text-white transition active:scale-95 flex items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider cursor-pointer shadow-lg"'
text = text.replace(old_front, new_front)

with open('src/components/settings/MachineManagerView.tsx', 'w') as f:
    f.write(text)
