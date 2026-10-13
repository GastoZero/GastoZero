import { useState } from "react"
import { Check, ArrowUpRight } from "lucide-react"
import type { Subscription, Page } from "../types"
import { billingLabel, formatCurrency } from "../lib/format"
import PageHeader from "../components/PageHeader"
import ServiceMark from "../components/ServiceMark"
import Switch from "../components/Switch"

interface Props {
  subscriptions: Subscription[]
  navigate: (p: Page) => void
}

type Tone = "danger" | "warn" | "neutral"

export default function Alerts({ subscriptions, navigate }: Props) {
  const [prefs, setPrefs] = useState({ day1: true, day3: true, day7: false })
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const active = subscriptions
    .filter(s => s.status === "active" && !dismissed.has(s.id))
    .sort((a, b) => a.daysUntil - b.daysUntil)
  const groups: { label: string; description: string; tone: Tone; items: Subscription[] }[] = [
    { label: "Urgente", description: "hoje ou amanhã", tone: "danger", items: active.filter(s => s.daysUntil <= 1) },
    { label: "Próximos dias", description: "em até 3 dias", tone: "warn", items: active.filter(s => s.daysUntil > 1 && s.daysUntil <= 3) },
    { label: "Próximas duas semanas", description: "em até 14 dias", tone: "neutral", items: active.filter(s => s.daysUntil > 3 && s.daysUntil <= 14) },
    { label: "Mais adiante", description: "depois de 14 dias", tone: "neutral", items: active.filter(s => s.daysUntil > 14) },
  ]
  const hasAny = groups.some(g => g.items.length > 0)

  const togglePref = (k: keyof typeof prefs) => setPrefs(p => ({ ...p, [k]: !p[k] }))
  const dismiss = (id: string) => setDismissed(prev => new Set([...prev, id]))

  return (
    <div className="min-h-full pb-24 md:pb-10">
      <PageHeader
        eyebrow="Calendário"
        title="Alertas"
        description="Saiba o que vai ser cobrado antes de ser cobrado."
      />

      <div className="px-4 md:px-10 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-7">
          {groups.map(
            g =>
              g.items.length > 0 && (
                <AlertGroup key={g.label} {...g} navigate={navigate} onDismiss={dismiss} />
              ),
          )}
          {!hasAny && (
            <div className="card border-dashed p-10 text-center text-muted text-sm">Nenhum alerta pendente.</div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="font-bold text-ink text-lg mb-1">Quando avisar</h2>
            <p className="text-xs text-muted mb-4">Antecedência dos lembretes de cobrança.</p>
            <div className="divide-y divide-line">
              <PrefRow label="1 dia antes" checked={prefs.day1} onChange={() => togglePref("day1")} />
              <PrefRow label="3 dias antes" checked={prefs.day3} onChange={() => togglePref("day3")} />
              <PrefRow label="7 dias antes" checked={prefs.day7} onChange={() => togglePref("day7")} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

const TONE = {
  danger: { dot: "bg-danger", badge: "bg-danger-soft text-danger", edge: "border-l-danger" },
  warn: { dot: "bg-warn", badge: "bg-warn-soft text-warn", edge: "border-l-warn" },
  neutral: { dot: "bg-line-strong", badge: "bg-sunken text-ink-2", edge: "border-l-line" },
}

interface AlertGroupProps {
  label: string
  description: string
  items: Subscription[]
  tone: Tone
  navigate: (p: Page) => void
  onDismiss: (id: string) => void
}

function AlertGroup({ label, description, items, tone, navigate, onDismiss }: AlertGroupProps) {
  const t = TONE[tone]
  const total = items.reduce((sum, s) => sum + s.price, 0)

  return (
    <section>
      <div className="flex items-baseline gap-2.5 mb-3">
        <span className={`w-2 h-2 rounded-full ${t.dot} self-center`} />
        <h2 className="font-bold text-ink text-lg">{label}</h2>
        <span className="text-xs text-muted">{description}</span>
        <span className="ml-auto num text-sm text-ink-2">{formatCurrency(total)}</span>
      </div>
      <ul className="card divide-y divide-line overflow-hidden">
        {items.map(sub => (
          <li key={sub.id} className={`flex items-center gap-3 px-4 py-3.5 border-l-[3px] ${t.edge}`}>
            <ServiceMark name={sub.name} color={sub.color} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink text-sm truncate">{sub.name}</p>
              <p className="text-xs text-muted truncate">
                {sub.plan} · <span className="num">{sub.nextBillingLabel}</span>
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="num font-semibold text-ink text-sm">{formatCurrency(sub.price)}</p>
              <span className={`inline-block mt-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${t.badge}`}>
                {billingLabel(sub.daysUntil)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-1 ml-1">
              <IconAction label="Marcar como visto" onClick={() => onDismiss(sub.id)}>
                <Check size={15} />
              </IconAction>
              <IconAction label="Ver assinatura" onClick={() => navigate("subscriptions")}>
                <ArrowUpRight size={15} />
              </IconAction>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function IconAction({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-sunken transition-colors cursor-pointer"
    >
      {children}
    </button>
  )
}

function PrefRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-ink">{label}</span>
      <Switch checked={checked} onChange={onChange} label={`Avisar ${label}`} />
    </div>
  )
}
