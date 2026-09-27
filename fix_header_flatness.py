with open('src/components/ui/ExpandableCard.tsx', 'r') as f:
    text = f.read()

old_header_class = "        className={`${headerClassName} cursor-pointer transition-colors relative z-10 ${\n          isExpanded ? 'bg-white/5' : 'hover:bg-white/5 active:bg-white/10'\n        }`}"

new_header_class = "        className={`${headerClassName} cursor-pointer transition-colors relative z-10 hover:bg-white/5 active:bg-white/10`}"

text = text.replace(old_header_class, new_header_class)

with open('src/components/ui/ExpandableCard.tsx', 'w') as f:
    f.write(text)
