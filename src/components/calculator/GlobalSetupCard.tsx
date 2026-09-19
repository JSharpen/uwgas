import * as React from 'react';
import { motion, AnimatePresence, type PanInfo, useDragControls, useScroll, useTransform, useMotionTemplate } from 'framer-motion';

import { useStore } from '../../state/store';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../../state/uiStore';
import { useBodyLock } from '../../hooks/useBodyLock';
import { ActionSheet } from '../ui/ActionSheet';
import { GlobalSetupSummaryPill } from './GlobalSetupSummaryPill';
import { GlobalSetupInputs } from './GlobalSetupInputs';

export function GlobalSetupCard() {
  const isSetupPanelOpen = useUIStore((s) => s.isSetupPanelOpen);
  const setIsSetupPanelOpen = useUIStore((s) => s.setSetupPanelOpen);
  
  const activeSheet = useUIStore(s => s.activeSheet);
  const setActiveSheet = useUIStore(s => s.setActiveSheet);

  useBodyLock(isSetupPanelOpen || activeSheet !== 'none');

  const selectedPresetId = useUIStore((s) => s.selectedPresetId);
  const setSelectedPresetId = useUIStore((s) => s.setSelectedPresetId);

  const global = useStore(useShallow((s) => s.global));
  const setGlobal = useStore((s) => s.setGlobal);
  
  const machines = useStore(useShallow((s) => s.machines));
  const defaultMachineId = useStore((s) => s.defaultMachineId);
  const setDefaultMachineId = useStore((s) => s.setDefaultMachineId);
  const jigs = useStore(useShallow((s) => s.jigs));
  const usbs = useStore(useShallow((s) => s.usbs));
  
  const sessionPresets = useStore(useShallow((s) => s.sessionPresets));
  const loadPreset = useStore((s) => s.loadPreset);

  const onLoadPreset = (id: string) => {
    setSelectedPresetId(id);
    if (id) loadPreset(id);
  };

  const activeJig = jigs.find(j => j.id === global.activeJigId) || jigs[0];
  const activeUsb = usbs.find(u => u.id === global.activeUsbId) || usbs[0]; 

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });
  const topMaskOpacity = useTransform(scrollY, [0, 24], [1, 0], { clamp: true });
  const headerShadowOpacity = useTransform(scrollY, [0, 24], [0, 1], { clamp: true });
  const maskImage = useMotionTemplate`linear-gradient(to bottom, rgba(0,0,0,${topMaskOpacity}), black 72px, black 100%)`;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const [drawerMaxHeight, setDrawerMaxHeight] = React.useState('500px');
  const [closeVelocity, setCloseVelocity] = React.useState(0);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 60 || info.velocity.y > 200) {
      setCloseVelocity(info.velocity.y);
      setIsSetupPanelOpen(false);
    }
  };

  React.useEffect(() => {
    let rafId: number;
    const updateHeight = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        const headerBottomStr = getComputedStyle(document.documentElement).getPropertyValue('--progression-header-bottom').trim();
        const headerBottom = headerBottomStr ? parseFloat(headerBottomStr) : 76;
        
        const gapStr = getComputedStyle(document.documentElement).getPropertyValue('--card-stack-gap').trim();
        const gap = gapStr ? parseFloat(gapStr) : 12;
        
        const drawerBottomY = rect.top + 24;
        const maxH = Math.max(100, drawerBottomY - (headerBottom - 16) - gap);

        setDrawerMaxHeight(`${maxH}px`);
      });
    };

    updateHeight();
    
    const observer = new ResizeObserver(updateHeight);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', updateHeight, { passive: true });
    
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [isSetupPanelOpen]);

  return (
    <>
      <AnimatePresence>
        {isSetupPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-20"
            onClick={() => setIsSetupPanelOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed left-3 right-3 sm:left-auto sm:right-auto sm:w-[576px] z-30 mx-auto pointer-events-none flex flex-col justify-end bottom-[calc(64px_+_env(safe-area-inset-bottom)_+_12px)] sm:bottom-[calc(64px_+_env(safe-area-inset-bottom)_+_16px)]">
        <div id="global-setup-card" ref={containerRef} className="relative w-full pointer-events-none">
          
          <AnimatePresence>
            {isSetupPanelOpen && (
              <motion.div 
                className="absolute bottom-[calc(100%-24px)] left-0 right-0 overflow-hidden pointer-events-none rounded-t-3xl flex flex-col z-0 [transform:translateZ(0)]"
                initial={{ maxHeight: '100px' }}
                animate={{ maxHeight: drawerMaxHeight }}
                exit={{ maxHeight: '100px' }}
                style={{ maxHeight: drawerMaxHeight, height: drawerMaxHeight }}
              >
                <motion.div 
                  className="w-full h-full max-h-full neu-convex border border-black/40 shadow-2xl rounded-t-3xl rounded-b-none pb-6 pt-0 relative flex flex-col min-h-0 bg-[#09090b] [transform:translateZ(0)]"
                  initial="closed"
                  custom={closeVelocity}
                  animate="open"
                  exit="closed"
                  variants={{
                    open: { y: 0, pointerEvents: 'auto', transition: { type: "spring", damping: 25, stiffness: 200 } },
                    closed: (velocity) => ({ 
                      y: drawerMaxHeight, 
                      pointerEvents: 'none', 
                      transition: { type: "spring", velocity, damping: 25, stiffness: 200 } 
                    })
                  }}
                  drag="y"
                  dragListener={false}
                  dragControls={dragControls}
                  dragConstraints={{ top: 0 }}
                  dragElastic={{ top: 0.1, bottom: 0.1 }}
                  onDragEnd={handleDragEnd}
                >
                {/* WRAPPER: Handles relative positioning for the scroll layout */}
                <div className="flex-1 min-h-0 relative z-10">
                  
                  {/* THE ULTIMATE HEADER (Option 2 Physical Shape) */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-10 neu-convex border-b border-black/40 rounded-t-3xl flex flex-col items-center justify-center touch-none z-30 cursor-grab active:cursor-grabbing shadow-sm"
                    onPointerDown={(e) => dragControls.start(e)}
                  >
                    <div className="w-12 h-1.5 rounded-full bg-white/20 neu-concave mx-auto" />
                  </div>

                  {/* DYNAMIC DROP SHADOW (Fades in on scroll) */}
                  <motion.div 
                    className="absolute top-10 left-0 right-0 h-6 bg-gradient-to-b from-black/80 to-transparent z-20 pointer-events-none"
                    style={{ opacity: headerShadowOpacity }}
                  />

                  {/* MASK WRAPPER: Option 1 Transparency Fade */}
                  <motion.div 
                    className="absolute inset-0 z-10"
                    style={{ maskImage: maskImage, WebkitMaskImage: maskImage }}
                  >
                    {/* SCROLL CONTAINER: Handles the scrolling */}
                    <div 
                      ref={scrollRef}
                      className="absolute inset-0 px-4 sm:px-5 pt-14 pb-0 flex flex-col gap-4 overflow-y-auto overscroll-contain touch-pan-y"
                    >
                      <GlobalSetupInputs />

                      {/* Hardware Selection Action Sheet Triggers */}
                      <div className="flex flex-row-reverse flex-wrap-reverse gap-2.5 w-full">
                        <button 
                          type="button" 
                          className="flex-auto min-w-[90px] flex flex-col items-center justify-center p-3.5 neu-button rounded-2xl transition-all min-h-[56px] overflow-hidden" 
                          onClick={() => setActiveSheet('jig')}
                        >
                          <span className="text-[10px] uppercase font-bold text-white/40 mb-1 tracking-widest text-center w-full truncate">Jig</span>
                          <span className="text-xs font-bold text-white/90 truncate w-full text-center tabular-nums">{activeJig?.name}</span>
                        </button>
                        <button 
                          type="button" 
                          className="flex-auto min-w-[90px] flex flex-col items-center justify-center p-3.5 neu-button rounded-2xl transition-all min-h-[56px] overflow-hidden" 
                          onClick={() => setActiveSheet('usb')}
                        >
                          <span className="text-[10px] uppercase font-bold text-white/40 mb-1 tracking-widest text-center w-full truncate">USB</span>
                          <span className="text-xs font-bold text-white/90 truncate w-full text-center tabular-nums">{activeUsb?.name}</span>
                        </button>
                        <button 
                          type="button" 
                          className="flex-auto min-w-[90px] flex flex-col items-center justify-center p-3.5 neu-button rounded-2xl transition-all min-h-[56px] overflow-hidden" 
                          onClick={() => setActiveSheet('machine')}
                        >
                          <span className="text-[10px] uppercase font-bold text-white/40 mb-1 tracking-widest text-center w-full truncate">Machine</span>
                          <span className="text-xs font-bold text-white/90 truncate w-full text-center tabular-nums">{machines.find(m => m.id === defaultMachineId)?.name || 'Default'}</span>
                        </button>
                      </div>
                      {/* Invisible spacer to ensure scrollable bottom padding (Safari fix) */}
                      <div className="h-px shrink-0 w-full" />
                    </div>
                  </motion.div>
                </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <GlobalSetupSummaryPill />
        </div>
      </div>

      {/* Action Sheets for Hardware */}
      <ActionSheet isOpen={activeSheet === 'machine'} onClose={() => setActiveSheet('none')}>
        <ActionSheet.Content title="Select Machine">
          <ActionSheet.Scrollable>
            {machines.map(m => (
              <ActionSheet.Item 
                key={m.id} 
                selected={m.id === defaultMachineId}
                onClick={() => {
                  setDefaultMachineId(m.id);
                  setActiveSheet('none');
                }}
              >
                {m.name}
              </ActionSheet.Item>
            ))}
          </ActionSheet.Scrollable>
        </ActionSheet.Content>
      </ActionSheet>

      <ActionSheet isOpen={activeSheet === 'usb'} onClose={() => setActiveSheet('none')}>
        <ActionSheet.Content title="Select Support Bar (USB)">
          <ActionSheet.Scrollable>
            {usbs.map(u => (
              <ActionSheet.Item 
                key={u.id} 
                selected={u.id === global.activeUsbId}
                meta={`Ds: ${u.Ds}mm`}
                onClick={() => {
                  setGlobal(g => ({ ...g, activeUsbId: u.id }));
                  setActiveSheet('none');
                }}
              >
                {u.name}
              </ActionSheet.Item>
            ))}
          </ActionSheet.Scrollable>
        </ActionSheet.Content>
      </ActionSheet>

      <ActionSheet isOpen={activeSheet === 'jig'} onClose={() => setActiveSheet('none')}>
        <ActionSheet.Content title="Select Sharpening Jig">
          <ActionSheet.Scrollable>
            {jigs.map(j => (
              <ActionSheet.Item 
                key={j.id} 
                selected={j.id === global.activeJigId}
                meta={`Length: ${j.length || j.Dj}mm`}
                disabled={global.calcMode === 'projection' && !j.isAdjustableLength}
                onClick={() => {
                  setGlobal(g => ({ ...g, activeJigId: j.id }));
                  setActiveSheet('none');
                }}
              >
                {j.name}
              </ActionSheet.Item>
            ))}
          </ActionSheet.Scrollable>
        </ActionSheet.Content>
      </ActionSheet>

      <ActionSheet isOpen={activeSheet === 'preset'} onClose={() => setActiveSheet('none')}>
        <ActionSheet.Content title="Select Preset">
          <ActionSheet.Scrollable>
            <ActionSheet.Item 
              selected={selectedPresetId === ''}
              onClick={() => {
                onLoadPreset('');
                setActiveSheet('none');
              }}
            >
              None (Clear selection)
            </ActionSheet.Item>
            {sessionPresets.map(p => (
              <ActionSheet.Item 
                key={p.id} 
                selected={p.id === selectedPresetId}
                meta={`${p.steps.length} step${p.steps.length === 1 ? '' : 's'}`}
                onClick={() => {
                  onLoadPreset(p.id);
                  setActiveSheet('none');
                }}
              >
                {p.name}
              </ActionSheet.Item>
            ))}
          </ActionSheet.Scrollable>
        </ActionSheet.Content>
      </ActionSheet>
    </>
  );
}

export default GlobalSetupCard;
