import re

with open('src/views/SettingsView.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { DevInteractionView } from '../components/settings/DevInteractionView';\n", "")

# Remove the route
old_route = """    if (view === 'dev-interaction') return <DevInteractionView onBack={handleBack} />;"""
content = content.replace(old_route, "")

with open('src/views/SettingsView.tsx', 'w') as f:
    f.write(content)

with open('src/components/settings/DevRootView.tsx', 'r') as f:
    content = f.read()

old_button = """        <button
          className="w-full flex items-center justify-between p-4 neu-convex active:neu-convex-pressed rounded-2xl group transition-all"
          onClick={() => onNavigate('dev-interaction')}
        >
          <div className="flex items-center gap-3 text-white group-active:text-white transition-colors">
            <IconChevronLeft className="w-5 h-5 rotate-180 opacity-40 group-active:opacity-100" />
            <span className="font-bold">Interaction Styles</span>
          </div>
          <span className="text-xs text-white/40">Toggle experimental UI</span>
        </button>"""

content = content.replace(old_button, "")

with open('src/components/settings/DevRootView.tsx', 'w') as f:
    f.write(content)

with open('src/components/layout/ContextBar.tsx', 'r') as f:
    content = f.read()

content = content.replace("  'dev-interaction': 'Interaction Styles',\n", "")

with open('src/components/layout/ContextBar.tsx', 'w') as f:
    f.write(content)

print("Settings cleaned up")
