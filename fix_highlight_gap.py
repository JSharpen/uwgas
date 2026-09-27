with open('src/components/ui/ExpandableCard.tsx', 'r') as f:
    text = f.read()

# Replace the Header classes and add the inner highlight layer
old_header = """      <div
        ref={headerRef}
        className={`${headerClassName} cursor-pointer transition-colors relative z-10 hover:bg-white/5 active:bg-white/10`}
        style={headerStyle}
        onClick={onToggle}
      >
        {header}
      </div>"""

new_header = """      <div
        ref={headerRef}
        className={`${headerClassName} cursor-pointer relative z-0 group/header`}
        style={headerStyle}
        onClick={onToggle}
      >
        {/* Extended Highlight Layer to cover nested corner gaps */}
        <div className="absolute top-0 left-0 right-0 -bottom-8 pointer-events-none transition-colors group-hover/header:bg-white/5 group-active/header:bg-white/10 z-[-1]" />
        {header}
      </div>"""

text = text.replace(old_header, new_header)

# Ensure the body grid wrapper is z-10 so it sits ABOVE the extended highlight layer
text = text.replace(
    'className="grid transition-[grid-template-rows] duration-300 ease-in-out relative z-0"',
    'className="grid transition-[grid-template-rows] duration-300 ease-in-out relative z-10"'
)
# Just in case it was already z-10 or missing:
text = text.replace(
    'className="grid transition-[grid-template-rows] duration-300 ease-in-out"',
    'className="grid transition-[grid-template-rows] duration-300 ease-in-out relative z-10"'
)

with open('src/components/ui/ExpandableCard.tsx', 'w') as f:
    f.write(text)
