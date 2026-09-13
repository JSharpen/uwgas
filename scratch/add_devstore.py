import re

with open('src/components/calculator/GlobalSetupCard.tsx', 'r') as f:
    content = f.read()

old_imports = """import { useStore } from '../../state/store';
import { useUIStore } from '../../state/uiStore';"""

new_imports = """import { useStore } from '../../state/store';
import { useUIStore } from '../../state/uiStore';
import { useDevStore } from '../../state/devStore';"""

content = content.replace(old_imports, new_imports)

old_hook = """export function GlobalSetupCard() {
  // Store subscriptions using atomic selectors"""

new_hook = """export function GlobalSetupCard() {
  const maskBottomFade = useDevStore(state => state.maskBottomFade);
  // Store subscriptions using atomic selectors"""

content = content.replace(old_hook, new_hook)

with open('src/components/calculator/GlobalSetupCard.tsx', 'w') as f:
    f.write(content)

print("Added useDevStore")
