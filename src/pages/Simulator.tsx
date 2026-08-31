import { useState } from "react"
import { ArrowRight } from "lucide-react"
import type { Subscription, Page } from "../types"
import { formatCurrency } from "../lib/format"

interface Props {
  subscriptions: Subscription[]
  navigate: (p: Page) => void
}

export default function Simulator({ subscriptions, navigate }: Props) {
  const active = subscriptions.filter(s => s.status === "active")
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const totalMonthly = active.reduce((sum, s) => sum + s.monthlyPrice, 0)
  const savingsMonthly = active
    .filter(s => checked.has(s.id))
    .reduce((sum, s) => sum + s.monthlyPrice, 0)
  const afterMonthly = totalMonthly - savingsMonthly
  const savingsAnnual = savingsMonthly * 12
  const reductionPct = totalMonthly > 0 ? ((savingsMonthly / totalMonthly) * 100).toFixed(1) : "0"

  const fmt = formatCurrency

  const toggle = (id: number) =>
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const beforePct = 100
  const afterPct = totalMonthly > 0 ? (afterMonthly / totalMonthly) * 100 : 100

  return (
    <div className="min-h-full pb-20 md:pb-6">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-5 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-800">Simulador de Economia</h1>
        <p className="text-sm text-slate-500 mt-0.5">Descubra quanto você poderia economizar revisando suas assinaturas.</p>
      </header>

      <div className="px-4 md:px-8 py-6 grid md:grid-cols-2 gap-6">
        {/* Left: subscription checklist */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Selecione as assinaturas que você considera pausar ou cancelar:
          </p>
          <div className="space-y-2">
            {active.length === 0 && (
              <p className="text-sm text-slate-400 bg-white border border-slate-200 rounded-xl p-6 text-center">
                Você ainda não possui assinaturas ativas para simular.
              </p>
            )}
            {active.map(sub => {
              const isChecked = checked.has(sub.id)
              return (
                <label
                  key={sub.id}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? "border-green-400 bg-green-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(sub.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${
                      isChecked ? "border-green-600 bg-green-600" : "border-slate-300"
                    }`}
                  >
                    {isChecked && (
                      <svg viewBox="0 0 10 8" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 4l3 3 5-6" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xl">{sub.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{sub.name}</p>
                    <p className="text-xs text-slate-500">{sub.plan}</p>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ${isChecked ? "text-green-600" : "text-slate-700"}`}>
                    {fmt(sub.monthlyPrice)}<span className="text-xs font-normal text-slate-400">/mês</span>
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Right: results */}
        <div className="space-y-4">
          {/* Main savings card */}
          <div className={`rounded-2xl p-6 transition-all duration-300 ${savingsMonthly > 0 ? "bg-green-600" : "bg-slate-200"}`}>
            <p className={`text-sm font-medium mb-1 ${savingsMonthly > 0 ? "text-green-100" : "text-slate-500"}`}>
              Você poderia economizar
            </p>
            <p className={`text-4xl font-bold mb-1 ${savingsMonthly > 0 ? "text-white" : "text-slate-400"}`}>
              {fmt(savingsMonthly)}
              <span className="text-lg font-semibold"> por mês</span>
            </p>
            <p className={`text-lg font-semibold ${savingsMonthly > 0 ? "text-green-200" : "text-slate-400"}`}>
              {fmt(savingsAnnual)} por ano
            </p>
            {savingsMonthly === 0 && (
              <p className="text-slate-500 text-sm mt-2">
                Selecione assinaturas ao lado para simular.
              </p>
            )}
          </div>

          {/* Comparison */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Comparativo</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600">Gasto atual</span>
                  <span className="font-bold text-red-600">{fmt(totalMonthly)}/mês</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-400 rounded-full transition-all duration-500"
                    style={{ width: `${beforePct}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600">Após economia</span>
                  <span className="font-bold text-green-600">{fmt(afterMonthly)}/mês</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(afterPct, 2)}%` }}
                  />
                </div>
              </div>
            </div>

            {savingsMonthly > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <p className="text-slate-600 text-sm">
                  Isso representa uma redução de{" "}
                  <span className="font-bold text-green-600">{reductionPct}%</span>{" "}
                  nos seus gastos recorrentes.
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate("subscriptions")}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition group"
          >
            Revisar minhas assinaturas
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Savings breakdown */}
          {checked.size > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-3">Assinaturas selecionadas</h3>
              <div className="space-y-2">
                {active.filter(s => checked.has(s.id)).map(sub => (
                  <div key={sub.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{sub.icon}</span>
                      <span className="text-slate-700">{sub.name}</span>
                    </div>
                    <span className="font-semibold text-green-600">+ {fmt(sub.monthlyPrice)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-bold">
                  <span className="text-slate-700">Total economizado/mês</span>
                  <span className="text-green-700">{fmt(savingsMonthly)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
