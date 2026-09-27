with open('src/components/ui/ExpandableCard.tsx', 'r') as f:
    text = f.read()

# Revert header classes
old_header_class = "        className={`${headerClassName} cursor-pointer transition-all relative z-10 ${\n          isExpanded ? 'bg-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.4)] border-b border-black/60' : 'hover:bg-white/5 active:bg-white/10 border-b border-transparent'\n        }`}"

new_header_class = "        className={`${headerClassName} cursor-pointer transition-colors relative z-10 ${\n          isExpanded ? 'bg-white/5' : 'hover:bg-white/5 active:bg-white/10'\n        }`}"

text = text.replace(old_header_class, new_header_class)

text = text.replace('className="grid transition-[grid-template-rows] duration-300 ease-in-out relative z-0"', 'className="grid transition-[grid-template-rows] duration-300 ease-in-out relative z-10"')

with open('src/components/ui/ExpandableCard.tsx', 'w') as f:
    f.write(text)
