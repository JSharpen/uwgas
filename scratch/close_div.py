import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

old_button_end = """            </div>
          </button>
        </div>
      </div>

      {/* Action Sheets for Hardware */}"""

new_button_end = """            </div>
          </button>
          </div>
        </div>
      </div>

      {/* Action Sheets for Hardware */}"""

content = content.replace(old_button_end, new_button_end)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Div closed")
