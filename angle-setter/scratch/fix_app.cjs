const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The messed up lines are:
//   const [settingsView, setSettingsView] = React.useState<
//   React.useEffect(() => {
//     window.dispatchEvent(new CustomEvent("collapseAll"));
//   }, [view]);
//     'root' | 'machine' | 'hardware' | 'measurement' | 'import' | 'glossary'
//   >('root');

code = code.replace(
`  const [settingsView, setSettingsView] = React.useState<
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent("collapseAll"));
  }, [view]);
    'root' | 'machine' | 'hardware' | 'measurement' | 'import' | 'glossary'
  >('root');`,
`  const [settingsView, setSettingsView] = React.useState<
    'root' | 'machine' | 'hardware' | 'measurement' | 'import' | 'glossary'
  >('root');
  
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent("collapseAll"));
  }, [view]);`
);

fs.writeFileSync('src/App.tsx', code);
