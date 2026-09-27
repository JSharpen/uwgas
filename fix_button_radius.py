with open('src/components/ui/Button.tsx', 'r') as f:
    text = f.read()

text = text.replace(
    "md: 'h-11 px-4 text-[11px] rounded-[var(--ui-radius-core)]',",
    "md: 'h-11 px-4 text-[11px] rounded-2xl',"
)
text = text.replace(
    "lg: 'h-14 px-6 text-[13px] rounded-[var(--ui-radius-core)]'",
    "lg: 'h-14 px-6 text-[13px] rounded-[1.25rem]'"
)

with open('src/components/ui/Button.tsx', 'w') as f:
    f.write(text)
