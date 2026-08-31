import { useState } from "react"
import { Check, ExternalLink, Bell } from "lucide-react"
import type { Subscription, Page } from "../types"
import { billingLabel, formatCurrency } from "../lib/format"

interface Props {
  subscriptions: Subscription[]
  navigate: (p: Page) => void
}

export default function Alerts({ subscriptions, navigate }: Props) {
  const [prefs, setPrefs] = useState({ day1: true, day3: true, day7: false })
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())

  const active = subscriptions.filter(s => s.status === "active" && !dismissed.has(s.id))
  const urgent = active.filter(s => s.daysUntil <= 1)
  const soon = active.filter(s => s.daysUntil > 1 && s.daysUntil <= 3)
  const future = active.filter(s => s.daysUntil > 3 && s.daysUntil <= 14)
  const upcoming = active.filter(s => s.daysUntil > 14)

  const fmt = formatCurrency

  const togglePref = (k: keyof typeof prefs) =>
    setPrefs(p => ({ ...p, [k]: !p[k] }))

  const dismiss = (id: number) => setDismissed(prev => new Set([...prev, id]))

  return (
    <div className="min-h-full pb-20 md:pb-6">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-5 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-800">Alertas e Próximas Cobranças</h1>
        <p className="text-sm text-slate-500 mt-0.5">Não seja surpreendido por uma renovação.</p>
      </header>

      <div className="px-4 md:px-8 py-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {urgent.length > 0 && (
            <AlertGroup
              label="🔴 Urgente"
              description="Renovação iminente"
              items={urgent}
              theme="red"
              navigate={navigate}
              fmt={fmt}
              onDismiss={dismiss}
            />
          )}
          {soon.length > 0 && (
            <AlertGroup
              label="🟡 Próximos dias"
              description="Cobrança nos próximos 3 dias"
              items={soon}
              theme="amber"
              navigate={navigate}
              fmt={fmt}
              onDismiss={dismiss}
            />
          )}
          {future.length > 0 && (
            <AlertGroup
              label="📅 Esta semana"
              description="Cobrança nos próximos 14 dias"
              items={future}
              theme="slate"
              navigate={navigate}
              fmt={fmt}
              onDismiss={dismiss}
            />
          )}
          {upcoming.length > 0 && (
            <AlertGroup
              label="📆 Futuras"
              description="Cobranças mais distantes"
              items={upcoming}
              theme="slate"
              navigate={navigate}
              fmt={fmt}
              onDismiss={dismiss}
            />
          )}
          {urgent.length === 0 && soon.length === 0 && future.length === 0 && upcoming.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
              Nenhum alerta pendente.
            </div>
          )}
        </div>

        {/* Prefs panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={16} className="text-slate-500" />
              <h3 className="font-semibold text-slate-800">Preferências de alertas</h3>
            </div>
            <div className="space-y-3">
              <SwitchRow
                label="Avisar 1 dia antes"
                checked={prefs.day1}
                onChange={() => togglePref("day1")}
              />
              <SwitchRow
                label="Avisar 3 dias antes"
                checked={prefs.day3}
                onChange={() => togglePref("day3")}
              />
              <SwitchRow
                label="Avisar 7 dias antes"
                checked={prefs.day7}
                onChange={() => togglePref("day7")}
              />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-green-800 mb-1">Dica</p>
            <p className="text-xs text-green-700 leading-relaxed">
              Receba alertas antes de ser cobrado e decida se quer manter, pausar ou cancelar cada assinatura.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface AlertGroupProps {
  label: string
  description: string
  items: Subscription[]
  theme: "red" | "amber" | "slate"
  navigate: (p: Page) => void
  fmt: (v: number) => string
  onDismiss: (id: number) => void
}

function AlertGroup({ label, description, items, theme, navigate, fmt, onDismiss }: AlertGroupProps) {
  const bgMap = { red: "bg-red-50 border-red-200", amber: "bg-amber-50 border-amber-200", slate: "bg-white border-slate-200" }
  const textMap = { red: "text-red-700", amber: "text-amber-700", slate: "text-slate-600" }
  const badgeMap = { red: "bg-red-100 text-red-700", amber: "bg-amber-100 text-amber-700", slate: "bg-slate-100 text-slate-600" }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="font-semibold text-slate-800 text-sm">{label}</span>
        <span className="text-xs text-slate-500">{description}</span>
      </div>
      <div className="space-y-2.5">
        {items.map(sub => (
          <div key={sub.id} className={`rounded-2xl border p-4 ${bgMap[theme]}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl flex-shrink-0">{sub.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{sub.name}</p>
                    <p className="text-xs text-slate-500">{sub.plan} · {sub.nextBillingLabel}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-slate-800 text-sm">{fmt(sub.price)}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeMap[theme]}`}>
                      {billingLabel(sub.daysUntil)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2.5">
                  <button
                    onClick={() => onDismiss(sub.id)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition px-2 py-1 rounded-lg hover:bg-white/60"
                  >
                    <Check size={12} />
                    Marcar como visto
                  </button>
                  <button
                    onClick={() => navigate("subscriptions")}
                    className={`flex items-center gap-1 text-xs font-medium transition px-2 py-1 rounded-lg hover:bg-white/60 ${textMap[theme]}`}
                  >
                    <ExternalLink size={12} />
                    Ver assinatura
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        onClick={onChange}
        className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${checked ? "bg-green-600" : "bg-slate-200"}`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-1"}`}
        />
      </button>
    </div>
  )
}
