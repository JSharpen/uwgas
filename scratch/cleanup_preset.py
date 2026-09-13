import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

old_preset_row = """            {/* Top Row: Preset Name & Hardware Pill Chips */}
            <div className="relative z-10 flex flex-col items-start w-full gap-2 mb-3">
              <span className={`text-sm sm:text-base font-bold truncate w-full ${activePreset ? 'text-amber-400 font-semibold' : 'text-white/60'}`}>
                {activePreset ? activePreset.name : 'Custom Setup'}
              </span>
              <div className="grid grid-cols-3 gap-1.5 w-full">"""

new_preset_row = """            {/* Top Row: Hardware Pill Chips */}
            <div className="relative z-10 flex flex-col items-start w-full gap-2 mb-3">
              <div className="grid grid-cols-3 gap-1.5 w-full">"""

if old_preset_row in content:
    content = content.replace(old_preset_row, new_preset_row)
else:
    print("Could not find preset row")

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Preset name removed")
