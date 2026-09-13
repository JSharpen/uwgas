import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

old_string = """                <div className="h-px shrink-0 w-full" />
              </div>
            </div>

            {/* === SUMMARY PILL (Front Layer, Static) === */}"""

new_string = """                <div className="h-px shrink-0 w-full" />
              </div>
            </div>
          </div>

            {/* === SUMMARY PILL (Front Layer, Static) === */}"""

content = content.replace(old_string, new_string)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Drawer wrapper closed")
