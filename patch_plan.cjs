const fs = require('fs');
const file = '/home/jordancarruthers/.gemini/antigravity/brain/cd594dc6-0f35-4399-ab49-c11db511d060/implementation_plan.md';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '* Add a selection toggle (e.g., Radio buttons) titled "Solver Engine" before the Save button, allowing the user to select which solver\'s math is actually committed to the machine profile.',
  '* Add a selection toggle (e.g., Radio buttons) titled "Solver Engine" before the Save button, allowing the user to select which solver\'s math is actually committed to the machine profile.\n* When saving the profile, append the chosen method to the profile name (e.g., `"Tormek T-8 - Sep 17 (Least Squares)"`) so you can easily distinguish and switch between them in the Machine Manager later.'
);

fs.writeFileSync(file, code);
