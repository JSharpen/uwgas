with open('src/components/ui/Button.tsx', 'r') as f:
    text = f.read()

text = text.replace(
    "sm: 'py-2 px-3 text-[9px] rounded-lg',",
    "sm: 'p-2.5 text-[9px] rounded-lg',"
)
text = text.replace(
    "md: 'h-11 px-4 text-[11px] rounded-2xl',",
    "md: 'p-3.5 text-[11px] rounded-2xl',"
)
text = text.replace(
    "lg: 'h-14 px-6 text-[13px] rounded-[1.25rem]'",
    "lg: 'p-4 text-[13px] rounded-[1.25rem]'"
)

with open('src/components/ui/Button.tsx', 'w') as f:
    f.write(text)
