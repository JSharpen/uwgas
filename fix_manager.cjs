const fs = require('fs');
let code = fs.readFileSync('src/components/settings/MachineManagerView.tsx', 'utf8');

// I will just find the block and fix it.
const block = `        onSaveProfile={(profile) => {
          const newProfiles = [...(activeMachine.calibrationProfiles || []), profile];
          const newConstants = { ...activeMachine.constants };
          if (profile.rear) {
            newConstants.rear = { hc: profile.rear.hc, o: profile.rear.o };
          }
          if (profile.front) {
            newConstants.front = { hc: profile.front.hc, o: profile.front.o };
          }
          onUpdateMachine(activeMachine.id, {
            calibrationProfiles: newProfiles,
            activeCalibrationId: profile.id,
            constants: newConstants
          });
          setCalibratingMachineId(null);
        onCancel={() => setCalibratingMachineId(null)}
      />`;

const fixedBlock = `        onSaveProfile={(profile) => {
          const newProfiles = [...(activeMachine.calibrationProfiles || []), profile];
          const newConstants = { ...activeMachine.constants };
          if (profile.rear) {
            newConstants.rear = { hc: profile.rear.hc, o: profile.rear.o };
          }
          if (profile.front) {
            newConstants.front = { hc: profile.front.hc, o: profile.front.o };
          }
          onUpdateMachine(activeMachine.id, {
            calibrationProfiles: newProfiles,
            activeCalibrationId: profile.id,
            constants: newConstants
          });
          setCalibratingMachineId(null);
        }}
      />`;

code = code.replace(block, fixedBlock);
fs.writeFileSync('src/components/settings/MachineManagerView.tsx', code);
