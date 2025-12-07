import * as React from 'react';
import { createPortal } from 'react-dom';

type ThemeToken = {
  key: string;
  label: string;
};

const TOKENS: ThemeToken[] = [
  { key: '--color-bg', label: 'Background' },
  { key: '--color-panel', label: 'Panel' },
  { key: '--color-panel-strong', label: 'Panel strong' },
  { key: '--color-border', label: 'Border' },
  { key: '--color-border-strong', label: 'Border strong' },
  { key: '--color-text', label: 'Text' },
  { key: '--color-text-muted', label: 'Text muted' },
  { key: '--color-focus', label: 'Focus' },
  { key: '--color-accent', label: 'Accent' },
  { key: '--color-accent-strong', label: 'Accent strong' },
  { key: '--color-accent-soft', label: 'Accent soft' },
  { key: '--color-danger', label: 'Danger' },
  { key: '--color-danger-soft', label: 'Danger soft' },
  { key: '--color-warning', label: 'Warning' },
  { key: '--color-warning-soft', label: 'Warning soft' },
  { key: '--color-disabled', label: 'Disabled' },
];

type ThemeLabState = Record<string, string>;
type HSV = { h: number; s: number; v: number };

const HEX_REGEX = /^#?[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/;

const sampleCss = (tokens: ThemeLabState) =>
  `:root {\n${TOKENS.map(t => `  ${t.key}: ${tokens[t.key] || '#000000'};`).join('\n')}\n}`;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const parsed = hex.replace('#', '');
  const value = parsed.length === 3 ? parsed.split('').map(c => c + c).join('') : parsed.padEnd(6, '0');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsv({ r, g, b }: { r: number; g: number; b: number }): HSV {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s, v };
}

function hsvToRgb({ h, s, v }: HSV): { r: number; g: number; b: number } {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rn = 0, gn = 0, bn = 0;
  if (0 <= h && h < 60) { rn = c; gn = x; bn = 0; }
  else if (60 <= h && h < 120) { rn = x; gn = c; bn = 0; }
  else if (120 <= h && h < 180) { rn = 0; gn = c; bn = x; }
  else if (180 <= h && h < 240) { rn = 0; gn = x; bn = c; }
  else if (240 <= h && h < 300) { rn = x; gn = 0; bn = c; }
  else { rn = c; gn = 0; bn = x; }
  return {
    r: (rn + m) * 255,
    g: (gn + m) * 255,
    b: (bn + m) * 255,
  };
}

const hexToHsv = (hex: string): HSV => rgbToHsv(hexToRgb(hex));
const hsvToHex = (hsv: HSV): string => rgbToHex(hsvToRgb(hsv));

const normalizeHex = (val: string): string | null => {
  const clean = val.trim();
  const stripped = clean.startsWith('#') ? clean.slice(1) : clean;
  if (!HEX_REGEX.test(stripped)) return null;
  return `#${stripped.toLowerCase()}`;
};

const baseRgbHex = (hex: string): string => `#${hex.replace('#', '').slice(0, 6)}`;

function ThemeLab(): React.ReactElement {
  const [tokens, setTokens] = React.useState<ThemeLabState>({});
  const [initialTokens, setInitialTokens] = React.useState<ThemeLabState | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [picker, setPicker] = React.useState<{ key: string; hsv: HSV } | null>(null);
  const [hexInput, setHexInput] = React.useState<string>('#000000');

  React.useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const next: ThemeLabState = {};
    TOKENS.forEach(t => {
      const val = style.getPropertyValue(t.key)?.trim();
      next[t.key] = val || '#000000';
    });
    setTokens(next);
    setInitialTokens(next);
  }, []);

  const updateVar = (key: string, value: string) => {
    setTokens(prev => ({ ...prev, [key]: value }));
    document.documentElement.style.setProperty(key, value);
  };

  const resetDefaults = () => {
    if (!initialTokens) return;
    setTokens(initialTokens);
    Object.entries(initialTokens).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    if (picker) {
      const fallback = normalizeHex(initialTokens[picker.key] || '#000000') || '#000000';
      setHexInput(fallback);
      setPicker({ key: picker.key, hsv: hexToHsv(baseRgbHex(fallback)) });
    }
    setStatus('Reset to defaults');
    setTimeout(() => setStatus(null), 1500);
  };

  const cssText = sampleCss(tokens);

  const copyCss = () => {
    navigator.clipboard
      .writeText(cssText)
      .then(() => setStatus('CSS copied to clipboard'))
      .catch(() => setStatus('Copy failed'));
    setTimeout(() => setStatus(null), 1800);
  };

  React.useEffect(() => {
    if (picker) {
      const prev = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = prev;
      };
    }
  }, [picker]);

  const pickerModal =
    picker &&
    createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-neutral-950 border u-border rounded-lg p-4 w-full max-w-md shadow-xl max-h-[90vh] overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm u-text">Adjust {picker.key}</div>
              <div className="text-xs u-text-muted">Drag in the grid, then hue bar.</div>
            </div>
            <button
              type="button"
              className="px-2 py-1 rounded border u-border u-surface text-xs u-text"
              onClick={() => setPicker(null)}
            >
              Close
            </button>
          </div>

          <GradientPicker
            hsv={picker.hsv}
            onChange={next => {
              setPicker({ key: picker.key, hsv: next });
              updateVar(picker.key, hsvToHex(next));
              setHexInput(hsvToHex(next));
            }}
          />

          <div className="mt-3 flex items-center gap-2">
            <input
              value={hexInput}
              onChange={e => {
                const val = e.target.value;
                setHexInput(val);
                const normalized = normalizeHex(val);
                if (normalized && picker) {
                  const rgbHex = baseRgbHex(normalized);
                  const hsv = hexToHsv(rgbHex);
                  setPicker({ key: picker.key, hsv });
                  updateVar(picker.key, normalized);
                }
              }}
              onBlur={() => {
                const normalized = normalizeHex(hexInput);
                if (!normalized && picker) {
                  const fallback = normalizeHex(tokens[picker.key] || '#000000') || '#000000';
                  setHexInput(fallback);
                  setPicker({ key: picker.key, hsv: hexToHsv(baseRgbHex(fallback)) });
                }
              }}
              className="flex-1 rounded border u-border u-surface text-sm u-text px-2 py-1 font-mono"
              placeholder="#aabbcc or #aabbccdd"
              spellCheck={false}
              maxLength={9}
            />
            <button
              type="button"
              className="px-2 py-1 rounded border border-accent bg-accent-tint text-xs text-accent whitespace-nowrap"
              onClick={() => {
                navigator.clipboard
                  .writeText(tokens[picker.key] || '')
                  .then(() => setStatus('Copied color to clipboard'))
                  .catch(() => setStatus('Copy failed'));
              }}
            >
              Copy value
            </button>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <div className="u-surface border u-border rounded-lg p-4 flex flex-col gap-4 motion-panel">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold u-text panel-header">Theme Lab</h2>
          <p className="text-sm u-text-muted">
            Tweak theme variables, preview, and copy a ready-to-use CSS override.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-3 py-1 rounded border u-border u-surface text-accent hover:bg-neutral-900 text-sm"
            onClick={resetDefaults}
            disabled={!initialTokens}
          >
            Reset
          </button>
          <button
            type="button"
            className="px-3 py-1 rounded border border-accent bg-accent-tint text-accent hover:bg-neutral-900"
            onClick={copyCss}
          >
            Copy CSS
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TOKENS.map(token => (
              <label
                key={token.key}
                className="flex items-center gap-2 p-2 rounded border u-border u-surface-strong"
              >
                <div className="w-6 h-6 rounded border u-border" style={{ background: tokens[token.key] }} />
                <div className="flex flex-col">
                  <span className="text-sm u-text">{token.label}</span>
                  <span className="text-[0.7rem] u-text-muted">{token.key}</span>
                </div>
                <div className="ml-auto flex flex-col gap-1 items-end">
                  <button
                    type="button"
                  className="px-2 py-1 rounded border u-border u-surface text-xs u-text"
                    onClick={() => {
                      const initial = normalizeHex(tokens[token.key] || '#000000') || '#000000';
                      setHexInput(initial);
                      setPicker({ key: token.key, hsv: hexToHsv(baseRgbHex(initial)) });
                    }}
                  >
                    Pick color
                  </button>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="p-3 rounded border u-border u-surface-strong">
            <h3 className="text-sm font-semibold u-text panel-header">Preview</h3>
            <div className="mt-3 space-y-2">
              <div className="p-3 rounded border u-border u-surface flex items-center justify-between">
                <div>
                  <div className="text-sm u-text">Card header</div>
                  <div className="text-xs u-text-muted">Muted text</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 rounded border border-accent bg-accent-tint text-accent text-xs">
                    Accent
                  </button>
                  <button className="px-2 py-1 rounded border border-danger bg-danger-tint text-danger text-xs">
                    Danger
                  </button>
                </div>
              </div>
              <div className="p-3 rounded border u-border u-surface">
                <div className="text-xs u-text-muted mb-1">Info</div>
                <div className="text-sm u-text">
                  This text uses <code className="font-mono">--color-text</code>, muted uses{' '}
                  <code className="font-mono">--color-text-muted</code>.
                </div>
              </div>
              <div className="p-3 rounded border u-border u-surface">
                <div className="text-xs u-text-muted mb-1">Selection</div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded border border-accent bg-accent-tint text-accent text-xs">
                    Selected
                  </span>
                  <span className="px-2 py-1 rounded border u-border text-xs u-text">Idle</span>
                  <span className="px-2 py-1 rounded border border-danger bg-danger-tint text-danger text-xs">
                    Error
                  </span>
                  <span className="px-2 py-1 rounded border border-warning bg-warning-tint text-warning text-xs">
                    Warning
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 rounded border u-border u-surface">
            <h3 className="text-sm font-semibold u-text">Generated CSS</h3>
            <textarea
              className="w-full h-48 mt-2 rounded border u-border u-surface font-mono text-xs u-text"
              readOnly
              value={cssText}
            />
            {status && <div className="text-[0.75rem] text-accent mt-1">{status}</div>}
          </div>
        </div>
      </div>

      {pickerModal}
    </div>
  );
}

export default ThemeLab;

function GradientPicker({
  hsv,
  onChange,
}: {
  hsv: HSV;
  onChange: (next: HSV) => void;
}): React.ReactElement {
  const boxRef = React.useRef<HTMLDivElement | null>(null);
  const hueRef = React.useRef<HTMLDivElement | null>(null);

  const hueColor = `hsl(${hsv.h}, 100%, 50%)`;

  const handleBox = (clientX: number, clientY: number) => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clamp01((clientX - rect.left) / rect.width);
    const y = clamp01((clientY - rect.top) / rect.height);
    onChange({ h: hsv.h, s: x, v: 1 - y });
  };

  const handleHue = (clientX: number) => {
    const rect = hueRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clamp01((clientX - rect.left) / rect.width);
    onChange({ h: x * 360, s: hsv.s, v: hsv.v });
  };

  const hueStops = ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#f00'];

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={boxRef}
        className="relative w-full aspect-square rounded border u-border cursor-crosshair"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})`,
        }}
        onMouseDown={e => {
          handleBox(e.clientX, e.clientY);
          const move = (ev: MouseEvent) => handleBox(ev.clientX, ev.clientY);
          const up = () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
          };
          window.addEventListener('mousemove', move);
          window.addEventListener('mouseup', up);
        }}
        onTouchStart={e => {
          const t = e.touches[0];
          handleBox(t.clientX, t.clientY);
        }}
        onTouchMove={e => {
          const t = e.touches[0];
          handleBox(t.clientX, t.clientY);
        }}
      >
        <div
          className="absolute w-3 h-3 rounded-full border border-white shadow"
          style={{
            left: `calc(${hsv.s * 100}% - 6px)`,
            top: `calc(${(1 - hsv.v) * 100}% - 6px)`,
          }}
        />
      </div>

      <div
        ref={hueRef}
        className="relative h-4 rounded border u-border cursor-pointer"
        style={{ background: `linear-gradient(to right, ${hueStops.join(',')})` }}
        onMouseDown={e => {
          handleHue(e.clientX);
          const move = (ev: MouseEvent) => handleHue(ev.clientX);
          const up = () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
          };
          window.addEventListener('mousemove', move);
          window.addEventListener('mouseup', up);
        }}
        onTouchStart={e => {
          const t = e.touches[0];
          handleHue(t.clientX);
        }}
        onTouchMove={e => {
          const t = e.touches[0];
          handleHue(t.clientX);
        }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-6 rounded border border-white shadow"
          style={{ left: `calc(${(hsv.h / 360) * 100}% - 4px)` }}
        />
      </div>
    </div>
  );
}
