export type ExpandToggleProps = {
  expanded: boolean;
  onToggle: () => void;
  labelExpanded: string;
  labelCollapsed: string;
};

export function ExpandToggle({
  expanded,
  onToggle,
  labelExpanded,
  labelCollapsed,
}: ExpandToggleProps) {
  return (
    <button
      type="button"
      className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 text-white/70 hover:text-white flex items-center justify-center border border-white/5 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400/30 select-none"
      aria-label={expanded ? labelExpanded : labelCollapsed}
      aria-expanded={expanded}
      onClick={onToggle}
      aria-pressed={expanded}
    >
      <svg
        viewBox="0 0 24 24"
        className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180 text-amber-400' : 'rotate-0 text-white/70'}`}
        aria-hidden="true"
      >
        <path
          d="M7 10l5 5 5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default ExpandToggle;
