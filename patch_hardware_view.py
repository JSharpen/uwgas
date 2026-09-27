with open('src/views/HardwareView.tsx', 'r') as f:
    text = f.read()

if "import { isMachineUnmapped }" not in text:
    text = text.replace(
        "import SegmentedControl from '../components/ui/SegmentedControl';",
        "import SegmentedControl from '../components/ui/SegmentedControl';\nimport { isMachineUnmapped } from '../utils/machineStatus';"
    )

if "const hasUnmappedMachines" not in text:
    text = text.replace(
        "export default function HardwareView() {",
        "export default function HardwareView() {\n  const machines = useStore(s => s.machines);\n  const hasUnmappedMachines = machines.some(isMachineUnmapped);\n"
    )

    text = text.replace(
        "const HARDWARE_TABS = [",
        "// We will compute options dynamically inside component\nconst STATIC_HARDWARE_TABS = ["
    )

    # Now define HARDWARE_TABS inside the component, but we have a problem: options are used in SegmentedControl
    # Let's just create dynamic tabs inside HardwareView.
    
    text = text.replace(
        '''      {!calibratingMachineId && (
        <SegmentedControl
          value={equipmentTab}
          onChange={(tab) => {
            setEquipmentTab(tab);
            useUIStore.getState().setExpandedEquipmentId(null);
          }}
          options={HARDWARE_TABS}''',
        '''      {!calibratingMachineId && (
        <SegmentedControl
          value={equipmentTab}
          onChange={(tab) => {
            setEquipmentTab(tab);
            useUIStore.getState().setExpandedEquipmentId(null);
          }}
          options={[
            { value: 'wheels' as const, label: 'Wheels' },
            { 
              value: 'machines' as const, 
              label: (
                <div className="flex items-center gap-1.5 relative">
                  Machines
                  {hasUnmappedMachines && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />}
                </div>
              ) 
            },
            { value: 'jigs' as const, label: 'Jigs' },
            { value: 'usbs' as const, label: 'USBs' },
          ]}'''
    )

with open('src/views/HardwareView.tsx', 'w') as f:
    f.write(text)
