with open('docs/DESIGN_LANGUAGE.md', 'r') as f:
    text = f.read()

text = text.replace(
    "- **Inner Header Highlight:** The clickable header region of the card changes from `hover:bg-white/5 active:bg-white/10` to a flat `bg-white/5` when expanded.",
    "- **Inner Header Highlight:** The clickable header region of the card relies strictly on `hover:bg-white/5 active:bg-white/10` for press interaction. Do NOT apply a permanent flat `bg-white/5` background when expanded, as this optically washes out the underlying `.neu-convex` 3D gradients and makes the component look flat and lifeless."
)

with open('docs/DESIGN_LANGUAGE.md', 'w') as f:
    f.write(text)
