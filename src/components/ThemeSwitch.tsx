import { Monitor, Moon, Sun } from "lucide-react"
import type { ThemePreference } from "../types"

interface Props {
  value: ThemePreference
  onChange: (t: ThemePreference) => void
  /** Mostra o nome de cada opção ao lado do ícone. */
  withLabels?: boolean
}

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
]

export default function ThemeSwitch({ value, onChange, withLabels }: Props) {
  return (
    <div role="radiogroup" aria-label="Tema" className="inline-flex p-0.5 rounded-lg bg-sunken border border-line">
      {OPTIONS.map(({ value: v, label, icon: Icon }) => {
        const on = value === v
        return (
          <button
            key={v}
            role="radio"
            aria-checked={on}
            title={label}
            onClick={() => onChange(v)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              on ? "bg-surface text-ink shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-line" : "text-muted hover:text-ink"
            }`}
          >
            <Icon size={14} />
            {withLabels && label}
          </button>
        )
      })}
    </div>
  )
}
