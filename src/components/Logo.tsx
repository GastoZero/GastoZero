interface Props {
  size?: number
  /** Esconde o nome e mostra só o símbolo. */
  markOnly?: boolean
  /** Força cores claras (para uso sobre fundos escuros fixos). */
  onDark?: boolean
}

/** Símbolo "Ø": o zero cortado do GastoZero. */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="flex-shrink-0">
      <rect width="32" height="32" rx="8" fill="#0e1a26" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="none" stroke="#ffffff" strokeOpacity="0.08" />
      <circle cx="16" cy="16" r="7" fill="none" stroke="#4fe08f" strokeWidth="2.8" />
      <path d="M10.4 21.6 L21.6 10.4" stroke="#4fe08f" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  )
}

export default function Logo({ size = 30, markOnly, onDark }: Props) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      {!markOnly && (
        <span
          className={`font-display text-[1.3rem] font-bold tracking-[-0.03em] leading-none ${
            onDark ? "text-on-hero" : "text-ink"
          }`}
        >
          gasto<span className={onDark ? "text-hero-accent" : "text-brand"}>zero</span>
        </span>
      )}
    </span>
  )
}
