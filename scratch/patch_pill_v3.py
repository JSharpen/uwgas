import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

# Fix the fragment!
# Let's find:
old_part = """            {/* === SUMMARY PILL === */}
            {setupInteractionStyle === 'drawer' ? (
            {/* === SUMMARY PILL (Front Layer, Static) === */}"""

new_part = """            {/* === SUMMARY PILL === */}
            {setupInteractionStyle === 'drawer' ? (
            <>
            {/* === SUMMARY PILL (Front Layer, Static) === */}"""

content = content.replace(old_part, new_part)

old_part2 = """              </div>
            </div>
          </button>
            ) : ("""

new_part2 = """              </div>
            </div>
          </button>
          </>
            ) : ("""

content = content.replace(old_part2, new_part2)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Pill fixed!")
