import { useStore } from '../../state/store';
import { SettingGroup, SettingItem, SegmentedControl, SwitchToggle } from '../ui';

export type GeneralSettingsViewProps = Record<string, never>;

export default function GeneralSettingsView() {
  const heightMode = useStore((s) => s.heightMode);
  const setHeightMode = useStore((s) => s.setHeightMode);
  const calcMode = useStore((s) => s.global.calcMode);
  const useProtrusionMode = useStore((s) => s.global.useProtrusionMode);
  const showMachineOverrides = useStore((s) => s.global.showMachineOverrides);
  const showUsbOverrides = useStore((s) => s.global.showUsbOverrides);
  const setGlobal = useStore((s) => s.setGlobal);

  const solverDescription =
    calcMode === 'projection'
      ? 'Solves for the required Knife Projection (A / Pb) to achieve your target angle, keeping the Support Bar locked at a fixed height.'
      : 'Solves for the required Support Bar Height (hn / hr) to achieve your target angle, keeping knife projection fixed.';

  const projectionDescription = useProtrusionMode
    ? 'Caliper Protrusion (Pb) measures the blade stick-out from the jig collar using calipers.'
    : 'Standard Projection (A) measures the distance from the knife clamp stop collar directly to the apex/edge.';

  const baseDescription =
    heightMode === 'hr'
      ? 'Measures Support Bar height (hr) from the grindstone wheel perimeter to the top of the USB bar.'
      : 'Measures Support Bar height (hn) from the machine casing datum to the top of the USB bar.';

  return (
    <section className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-200 max-w-3xl mx-auto pb-20 w-full">
      <SettingGroup
        title="Calculation Engine"
        caption="Configure mathematical solvers and reference positions"
      >
        <SettingItem
          title="Calculation Solver Mode"
          description={solverDescription}
          control={
            <SegmentedControl
              isToggle
              orientation="vertical"
              value={calcMode === 'projection' ? 'projection' : 'height'}
              onChange={(val) =>
                setGlobal((g) => ({ ...g, calcMode: val as 'height' | 'projection' }))
              }
              options={[
                { value: 'height', label: 'Height' },
                { value: 'projection', label: 'Projection' },
              ]}
              ariaLabel="Calculation Solver Mode"
              className="w-24 sm:w-28 h-[72px] sm:h-20"
            />
          }
        />

        <SettingItem
          title="Projection Input Style"
          description={projectionDescription}
          control={
            <SegmentedControl
              isToggle
              orientation="vertical"
              value={useProtrusionMode ? 'protrusion' : 'standard'}
              onChange={(val) =>
                setGlobal((g) => ({ ...g, useProtrusionMode: val === 'protrusion' }))
              }
              options={[
                { value: 'standard', label: 'Proj A' },
                { value: 'protrusion', label: 'Caliper Pb' },
              ]}
              ariaLabel="Projection Input Style"
              className="w-24 sm:w-28 h-[72px] sm:h-20"
            />
          }
        />

        <SettingItem
          title="Measurement Reference Base"
          description={baseDescription}
          control={
            <SegmentedControl
              isToggle
              orientation="vertical"
              value={heightMode}
              onChange={(val) => setHeightMode(val as 'hn' | 'hr')}
              options={[
                { value: 'hn', label: 'Datum' },
                { value: 'hr', label: 'Wheel' },
              ]}
              ariaLabel="Measurement Reference Base"
              className="w-24 sm:w-28 h-[72px] sm:h-20"
            />
          }
        />
      </SettingGroup>

      <SettingGroup
        title="Progression Workflow"
        caption="Step customization and hardware overrides"
      >
        <SettingItem
          title="Machine Overrides"
          description={showMachineOverrides ? 'Enabled: Step cards can define custom machine overrides.' : 'Disabled: Steps inherit the global machine setting.'}
          control={
            <SwitchToggle
              checked={!!showMachineOverrides}
              onChange={(checked) =>
                setGlobal((g) => ({ ...g, showMachineOverrides: checked }))
              }
              ariaLabel="Toggle Per-Step Machine Overrides"
            />
          }
        />
        <SettingItem
          title="Support Bar (USB) Overrides"
          description={showUsbOverrides ? 'Enabled: Step cards can define custom Support Bar (USB) overrides.' : 'Disabled: Steps inherit the global USB setting.'}
          control={
            <SwitchToggle
              checked={!!showUsbOverrides}
              onChange={(checked) =>
                setGlobal((g) => ({ ...g, showUsbOverrides: checked }))
              }
              ariaLabel="Toggle Per-Step USB Overrides"
            />
          }
        />
      </SettingGroup>
    </section>
  );
}
