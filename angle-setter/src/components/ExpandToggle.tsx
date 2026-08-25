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
      className={`btn-toggle ${expanded ? 'btn-toggle--open' : ''}`}
      aria-label={expanded ? labelExpanded : labelCollapsed}
      aria-expanded={expanded}
      onClick={onToggle}
      aria-pressed={expanded}
    >
      <svg
        viewBox="0 0 24 24"
        className={'w-3 h-3 transition-transform ' + (expanded ? 'rotate-180' : 'rotate-0')}
        aria-hidden="true"
      >
        <path
          d="M7 10l5 5 5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default ExpandToggle;
