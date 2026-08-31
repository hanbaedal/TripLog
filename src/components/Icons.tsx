type MarkProps = { className?: string }

export function BrandMark({ className }: MarkProps) {
  return (
    <svg className={className} viewBox="0 0 36 36" aria-hidden="true">
      <rect width="36" height="36" rx="10" fill="#172033" />
      <path
        d="M8 26c6-2 9-11 20-12"
        stroke="#C9A86C"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="27" cy="14" r="3.2" fill="#C24532" />
      <circle cx="9" cy="25.5" r="1.7" fill="#E8DFD2" />
    </svg>
  )
}
