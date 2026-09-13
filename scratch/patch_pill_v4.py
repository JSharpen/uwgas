import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

# I need to find the `onClick={() => setActiveInlineRow(r => r === 'angle' ? 'none' : 'angle')}`
old_angle_btn = """                    <button 
                      type="button"
                      className={`flex items-baseline gap-1.5 p-1 -m-1 rounded-lg transition-colors active:scale-95 ${activeInlineRow === 'angle' ? 'bg-white/10' : ''}`}
                      onClick={() => setActiveInlineRow(r => r === 'angle' ? 'none' : 'angle')}
                    >"""

new_angle_btn = """                    <button 
                      type="button"
                      className={`flex items-baseline gap-1.5 p-1 -m-1 rounded-lg transition-colors active:scale-95 ${activeInlineRow === 'angle' ? 'bg-white/10' : ''}`}
                      onClick={() => {
                        if (setupInteractionStyle === 'inline') setActiveInlineRow(r => r === 'angle' ? 'none' : 'angle');
                        else if (setupInteractionStyle === 'sheet') setActiveSheet('angle');
                        else if (setupInteractionStyle === 'modal') setActiveModal('angle');
                      }}
                    >"""

content = content.replace(old_angle_btn, new_angle_btn)

old_proj_btn = """                    <button 
                      type="button"
                      className={`flex items-baseline gap-1.5 text-right ml-auto sm:ml-0 p-1 -m-1 rounded-lg transition-colors active:scale-95 ${activeInlineRow === 'projection' ? 'bg-white/10' : ''}`}
                      onClick={() => setActiveInlineRow(r => r === 'projection' ? 'none' : 'projection')}
                    >"""

new_proj_btn = """                    <button 
                      type="button"
                      className={`flex items-baseline gap-1.5 text-right ml-auto sm:ml-0 p-1 -m-1 rounded-lg transition-colors active:scale-95 ${activeInlineRow === 'projection' ? 'bg-white/10' : ''}`}
                      onClick={() => {
                        if (setupInteractionStyle === 'inline') setActiveInlineRow(r => r === 'projection' ? 'none' : 'projection');
                        else if (setupInteractionStyle === 'sheet') setActiveSheet('projection');
                        else if (setupInteractionStyle === 'modal') setActiveModal('projection');
                      }}
                    >"""

content = content.replace(old_proj_btn, new_proj_btn)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Buttons patched!")
