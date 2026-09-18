const fs = require('fs');
let code = fs.readFileSync('src/components/settings/DevStateView.tsx', 'utf8');

const newFunc = `
  const handleInjectDummyMappingData = () => {
    const state = useStore.getState();
    if (state.machines.length === 0) {
      alert('No machines found. Please add a machine first.');
      return;
    }
    
    import('../../utils/id').then(({ generateId }) => {
      const p1 = {
        id: generateId(),
        name: 'Factory Defaults',
        createdAt: new Date().toISOString(),
        scope: 'both',
        rear: { hc: 50, o: 20, diagnostics: { maxAbsResidualMm: 0.8 } },
        front: { hc: -10, o: 30, diagnostics: { maxAbsResidualMm: 0.9 } }
      };

      const p2 = {
        id: generateId(),
        name: 'Precision Laser Aligned',
        createdAt: new Date().toISOString(),
        scope: 'both',
        rear: { hc: 49.5, o: 19.8, diagnostics: { maxAbsResidualMm: 0.1 } },
        front: { hc: -9.5, o: 30.2, diagnostics: { maxAbsResidualMm: 0.05 } }
      };

      useStore.setState(s => {
        const newMachines = [...s.machines];
        const m = { ...newMachines[0] };
        m.calibrationProfiles = [p1, p2];
        m.activeCalibrationId = p2.id;
        m.constants = {
          rear: { hc: p2.rear.hc, o: p2.rear.o },
          front: { hc: p2.front.hc, o: p2.front.o }
        };
        newMachines[0] = m;
        return { machines: newMachines };
      });
      alert('Injected 2 dummy geometry mappings into the first machine!');
    });
  };

  const handleNukeState`;

code = code.replace(/const handleNukeState/, newFunc);

const newButton = `          <button 
            onClick={handleInjectDummyMappingData}
            className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 rounded-2xl py-3 px-4 font-bold text-sm tracking-wide transition-colors"
          >
            Inject Machine Mappings
          </button>
        </div>
        
        <button 
          onClick={handleNukeState}`;

code = code.replace(/<\/div>\n        \n        <button \n          onClick=\{handleNukeState\}/, newButton);

fs.writeFileSync('src/components/settings/DevStateView.tsx', code);
