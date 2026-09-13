import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

old_string = """            </div>
          </button>
        </div>
      </div>

      {/* Action Sheets for Hardware */}"""

new_string = """            </div>
          </button>
          </div>
        </div>
      </div>

      {/* Action Sheets for Hardware */}"""

content = content.replace(old_string, new_string)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Div finally closed")
