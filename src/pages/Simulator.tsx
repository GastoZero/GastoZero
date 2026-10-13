import { useState } from "react"
import { ArrowRight, Check } from "lucide-react"
import type { Subscription, Page } from "../types"
import { formatCurrency } from "../lib/format"
import PageHeader from "../components/PageHeader"
import ServiceMark from "../components/ServiceMark"

interface Props {
  subscriptions: Subscription[]
  navigate: (p: Page) => void
}

export default function Simulator({ subscriptions, navigate }: Props) {
  const active = [...subscriptions.filter(s => s.status === "active")].sort((a, b) => b.monthlyPrice - a.monthlyPrice)
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const totalMonthly = active.reduce((sum, s) => sum + s.monthlyPrice, 0)
  const savingsMonthly = active.filter(s => checked.has(s.id)).reduce((sum, s) => sum + s.monthlyPrice, 0)
  const afterMonthly = totalMonthly - savingsMonthly
  const reductionPct = totalMonthly > 0 ? (savingsMonthly / totalMonthly) * 100 : 0
  const has = savingsMonthly > 0

  const fmt = formatCurrency

  const toggle = (id: string) =>
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="min-h-full pb-24 md:pb-10">
      <PageHeader
        eyebrow="E se..."
        title="Simulador de cortes"
        description="Marque o que você pausaria ou cancelaria e veja o efeito no mês e no ano."
      />

      <div className="px-4 md:px-10 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          {active.length === 0 ? (
            <p className="card border-dashed p-10 text-center text-sm text-muted">
              Você ainda não tem assinaturas ativas para simular.
            </p>
          ) : (
            <ul className="card divide-y divide-line overflow-hidden">
              {active.map(sub => {
                const on = checked.has(sub.id)
                const share = totalMonthly > 0 ? (sub.monthlyPrice / totalMonthly) * 100 : 0
                return (
                  <li key={sub.id}>
                    <label
                      className={`flex items-center gap-3.5 px-4 py-3.5 cursor-pointer transition-colors ${
                        on ? "bg-brand-soft" : "hover:bg-sunken/50"
                      }`}
                    >
                      <input type="checkbox" checked={on} onChange={() => toggle(sub.id)} className="sr-only" />
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center border-2 flex-shrink-0 transition-colors ${
                          on ? "border-brand bg-brand" : "border-line-strong"
                        }`}
                      >
                        {on && <Check size={13} strokeWidth={3.5} className="text-on-brand" />}
                      </span>
                      <ServiceMark name={sub.name} color={sub.color} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${on ? "text-ink line-through decoration-brand decoration-2" : "text-ink"}`}>
                          {sub.name}
                        </p>
                        <p className="text-xs text-muted">
                          {sub.plan} · <span className="num">{share.toFixed(0)}%</span> do total
                        </p>
                      </div>
                      <span className="num text-sm font-semibold flex-shrink-0 text-ink">
                        {fmt(sub.monthlyPrice)}
                        <span className="text-xs font-normal text-muted">/mês</span>
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-6 self-start">
          <section className="rounded-xl bg-hero text-on-hero p-6">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-hero-muted">
              Economia no ano
            </p>
            <p className={`num text-[2.6rem] font-semibold leading-none mt-3 ${has ? "text-hero-accent" : "text-hero-muted"}`}>
              {fmt(savingsMonthly * 12)}
            </p>
            <p className="text-sm text-hero-muted mt-2">
              {has ? (
                <>
                  <span className="num text-on-hero">{fmt(savingsMonthly)}</span> a menos por mês ·{" "}
                  <span className="num text-on-hero">{reductionPct.toFixed(1)}%</span> do total
                </>
              ) : (
                "Marque assinaturas na lista para simular."
              )}
            </p>
          </section>

          <section className="card p-5">
            <h2 className="font-bold text-ink text-lg mb-4">Antes e depois</h2>
            <Meter label="Hoje" value={fmt(totalMonthly)} pct={100} tone="bg-ink-2" />
            <div className="h-3" />
            <Meter label="Com os cortes" value={fmt(afterMonthly)} pct={totalMonthly > 0 ? (afterMonthly / totalMonthly) * 100 : 100} tone="bg-brand" />
          </section>

          <button onClick={() => navigate("subscriptions")} className="btn-primary w-full py-3 group">
            Revisar assinaturas
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Meter({ label, value, pct, tone }: { label: string; value: string; pct: number; tone: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-ink-2">{label}</span>
        <span className="num font-semibold text-ink">{value}/mês</span>
      </div>
      <div className="h-2 bg-sunken rounded-full overflow-hidden">
        <div className={`h-full ${tone} rounded-full transition-all duration-500`} style={{ width: `${Math.max(pct, 1.5)}%` }} />
      </div>
    </div>
  )
}
