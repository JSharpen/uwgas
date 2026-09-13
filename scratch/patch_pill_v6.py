import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

# Replace the incorrect ModalShell definitions
old_angle_modal = """      <ModalShell
        isOpen={activeModal === 'angle'}
        onClose={() => setActiveModal('none')}
        title="Target Angle"
      >"""

new_angle_modal = """      {activeModal === 'angle' && (
      <ModalShell
        onClose={() => setActiveModal('none')}
        title="Target Angle"
      >"""

content = content.replace(old_angle_modal, new_angle_modal)

old_angle_modal_end = """        </div>
      </ModalShell>"""

new_angle_modal_end = """        </div>
      </ModalShell>
      )}"""

# Careful, there are two of these! We need to make sure we replace the right one.
# It's better to use regex or string replace with count.
content = content.replace("        </div>\n      </ModalShell>", "        </div>\n      </ModalShell>\n      )}", 1)


old_proj_modal = """      <ModalShell
        isOpen={activeModal === 'projection'}
        onClose={() => setActiveModal('none')}
        title={isProjectionMode ? 'Fixed USB' : 'Projection'}
      >"""

new_proj_modal = """      {activeModal === 'projection' && (
      <ModalShell
        onClose={() => setActiveModal('none')}
        title={isProjectionMode ? 'Fixed USB' : 'Projection'}
      >"""

content = content.replace(old_proj_modal, new_proj_modal)

content = content.replace("        </div>\n      </ModalShell>", "        </div>\n      </ModalShell>\n      )}", 1)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Modals fixed!")
