import re

with open('angle-dev-console.sh', 'r') as f:
    content = f.read()

# Replace `read -r choice` (and `main_choice`) in the menu loops.
# We'll target the pattern:
#         read -r choice
#
#         case "$choice" in
# And insert the auto-refresh logic.

pattern = re.compile(r'(\s+)read -r (main_choice|choice)\s*\n\s*case "\$(main_choice|choice)" in\s*\n')

def repl(match):
    indent = match.group(1)
    varname = match.group(2)
    return f"""{indent}read -t 3 -n 1 -r {varname} || {{ sleep 0.1; {varname}=""; }}
{indent}[[ -n "${varname}" ]] && echo ""

{indent}case "${varname}" in
{indent}    "") continue ;; # Auto-refresh timeout
"""

new_content = pattern.sub(repl, content)

with open('angle-dev-console.sh', 'w') as f:
    f.write(new_content)

print("Patched successfully")
