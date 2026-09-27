with open('src/components/ui/index.ts', 'r') as f:
    text = f.read()

if "export * from './Button';" not in text:
    text += "\nexport * from './Button';\nexport * from './Surface';\n"
    
with open('src/components/ui/index.ts', 'w') as f:
    f.write(text)
