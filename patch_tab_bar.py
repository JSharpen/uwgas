with open('src/components/layout/BottomTabBar.tsx', 'r') as f:
    text = f.read()

if "import { isMachineUnmapped }" not in text:
    text = text.replace(
        "import { isWheelOverdue } from '../../utils/wheelWear';",
        "import { isWheelOverdue } from '../../utils/wheelWear';\nimport { isMachineUnmapped } from '../../utils/machineStatus';"
    )

    text = text.replace(
        "const hasOverdueWheels = wheels.some(isWheelOverdue);",
        "const hasOverdueWheels = wheels.some(isWheelOverdue);\n  const machines = useStore((s) => s.machines);\n  const hasUnmappedMachines = machines.some(isMachineUnmapped);\n  const hardwareNeedsAttention = hasOverdueWheels || hasUnmappedMachines;"
    )

    text = text.replace(
        "{hasOverdueWheels && (",
        "{hardwareNeedsAttention && ("
    )

with open('src/components/layout/BottomTabBar.tsx', 'w') as f:
    f.write(text)
