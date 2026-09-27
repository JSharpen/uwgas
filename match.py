with open('src/components/CalibrationWizard.tsx', 'r') as f:
    text = f.read()

count_brace = 0
count_paren = 0
for i, c in enumerate(text):
    if c == '{': count_brace += 1
    elif c == '}': count_brace -= 1
    elif c == '(': count_paren += 1
    elif c == ')': count_paren -= 1

print(f"Braces mismatch: {count_brace}")
print(f"Parens mismatch: {count_paren}")
