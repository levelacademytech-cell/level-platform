interface BrandMarkProps {
  compact?: boolean
  className?: string
}

export function BrandMark({
  compact = false,
  className = '',
}: BrandMarkProps) {
  if (compact) {
    return (
      <svg
        className={className}
        viewBox="0 0 180 100"
        role="img"
        aria-label="LEVEL"
      >
        <g fill="currentColor">
          <rect x="4" y="20" width="43" height="10" rx="2" />
          <rect x="4" y="45" width="50" height="10" rx="2" />
          <rect x="4" y="70" width="57" height="10" rx="2" />

          <polygon points="48,15 67,15 90,61 113,15 132,15 90,89" />

          <rect x="133" y="20" width="43" height="10" rx="2" />
          <rect x="126" y="45" width="50" height="10" rx="2" />
          <rect x="119" y="70" width="57" height="10" rx="2" />
        </g>
      </svg>
    )
  }

  return (
    <svg
      className={className}
      viewBox="0 0 520 100"
      role="img"
      aria-label="LEVEL"
    >
      <g fill="currentColor">
        <rect x="10" y="13" width="16" height="67" rx="2" />
        <rect x="10" y="64" width="72" height="16" rx="2" />

        <rect x="103" y="13" width="69" height="14" rx="2" />
        <rect x="103" y="39" width="69" height="14" rx="2" />
        <rect x="103" y="66" width="69" height="14" rx="2" />

        <polygon points="195,13 216,13 250,64 284,13 305,13 250,88" />

        <rect x="329" y="13" width="69" height="14" rx="2" />
        <rect x="329" y="39" width="69" height="14" rx="2" />
        <rect x="329" y="66" width="69" height="14" rx="2" />

        <rect x="492" y="13" width="16" height="67" rx="2" />
        <rect x="436" y="64" width="72" height="16" rx="2" />
      </g>
    </svg>
  )
}