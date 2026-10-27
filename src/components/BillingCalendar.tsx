import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Subscription } from "../types"
import { addMonths, formatCurrency, parseISODate, toISODate } from "../lib/format"
import { serviceColor } from "../data/catalog"
import ServiceMark from "./ServiceMark"

interface Props {
  subscriptions: Subscription[]
}

interface Charge {
  sub: Subscription
  /** Valor realmente cobrado no dia (preço do ciclo, não o mensal normalizado). */
  amount: number
}

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"]
const MAX_DOTS = 3

/**
 * Lista as cobranças de cada assinatura ativa que caem no mês informado.
 * Parte da próxima cobrança e anda para trás e para frente pelo ciclo, então
 * também mostra o que já foi cobrado no começo do mês.
 */
function chargesInMonth(subscriptions: Subscription[], year: number, month: number) {
  const byDay = new Map<number, Charge[]>()

  for (const sub of subscriptions) {
    if (sub.status !== "active") continue
    const anchor = parseISODate(sub.nextBilling)
    if (!anchor) continue

    const step = sub.cycle === "yearly" ? 12 : 1
    // Distância em meses entre a âncora e o mês exibido.
    const diff = (year - anchor.getFullYear()) * 12 + (month - anchor.getMonth())
    if (diff % step !== 0) continue

    // Sempre a partir da âncora, para não perder o dia original (ex.: 31) ao passar por meses curtos.
    const date = addMonths(anchor, diff)
    const day = date.getDate()
    const list = byDay.get(day) ?? []
    list.push({ sub, amount: sub.price })
    byDay.set(day, list)
  }

  for (const list of byDay.values()) list.sort((a, b) => b.amount - a.amount)
  return byDay
}

export default function BillingCalendar({ subscriptions }: Props) {
  const today = new Date()
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  const byDay = useMemo(() => chargesInMonth(subscriptions, year, month), [subscriptions, year, month])

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leadingBlanks = new Date(year, month, 1).getDay()

  // Dia selecionado: hoje no mês atual; nos outros, o primeiro dia com cobrança.
  const firstChargeDay = byDay.size ? Math.min(...byDay.keys()) : 1
  const defaultDay = isCurrentMonth ? today.getDate() : firstChargeDay
  const [picked, setPicked] = useState<{ key: string; day: number } | null>(null)
  const monthKey = `${year}-${month}`
  const selectedDay = picked?.key === monthKey ? picked.day : defaultDay
  const selectedCharges = byDay.get(selectedDay) ?? []

  const monthTotal = [...byDay.values()].flat().reduce((sum, c) => sum + c.amount, 0)
  const chargeCount = [...byDay.values()].reduce((n, list) => n + list.length, 0)

  const monthLabel = cursor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  const selectedLabel = new Date(year, month, selectedDay).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const goMonth = (delta: number) => setCursor(c => addMonths(c, delta))

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h2 className="font-bold text-ink text-lg capitalize">{monthLabel}</h2>
        <div className="flex gap-1">
          <NavButton label="Mês anterior" onClick={() => goMonth(-1)}>
            <ChevronLeft size={16} />
          </NavButton>
          <NavButton label="Próximo mês" onClick={() => goMonth(1)}>
            <ChevronRight size={16} />
          </NavButton>
        </div>
      </div>
      <p className="text-xs text-muted mb-4">
        {chargeCount === 0 ? (
          "Nenhuma cobrança neste mês."
        ) : (
          <>
            {chargeCount} {chargeCount === 1 ? "cobrança" : "cobranças"} ·{" "}
            <span className="num font-semibold text-ink">{formatCurrency(monthTotal)}</span> saem neste mês
          </>
        )}
      </p>

      <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-label={`Cobranças de ${monthLabel}`}>
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="font-mono text-[10px] font-medium text-muted pb-1" aria-hidden="true">
            {d}
          </span>
        ))}

        {Array.from({ length: leadingBlanks }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const charges = byDay.get(day) ?? []
          const isToday = isCurrentMonth && day === today.getDate()
          const isPast = toISODate(new Date(year, month, day)) < toISODate(today)
          const isSelected = day === selectedDay
          const dayTotal = charges.reduce((sum, c) => sum + c.amount, 0)

          return (
            <button
              key={day}
              onClick={() => setPicked({ key: monthKey, day })}
              aria-pressed={isSelected}
              aria-label={
                charges.length
                  ? `Dia ${day}: ${charges.length} ${charges.length === 1 ? "cobrança" : "cobranças"}, ${formatCurrency(dayTotal)}`
                  : `Dia ${day}: sem cobranças`
              }
              className={`relative aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer border ${
                isSelected
                  ? "bg-brand-soft border-brand"
                  : charges.length
                    ? "bg-sunken border-transparent hover:border-line-strong"
                    : "border-transparent hover:bg-sunken"
              }`}
            >
              <span
                className={`num text-[13px] leading-none ${
                  isToday ? "font-bold text-brand" : isPast ? "text-muted" : "text-ink"
                }`}
              >
                {day}
              </span>
              <span className={`flex items-center gap-[3px] h-[6px] ${isPast ? "opacity-50" : ""}`} aria-hidden="true">
                {charges.slice(0, MAX_DOTS).map(c => (
                  <span
                    key={c.sub.id}
                    className="w-[6px] h-[6px] rounded-full"
                    style={{ background: serviceColor(c.sub.name, c.sub.color) }}
                  />
                ))}
                {charges.length > MAX_DOTS && (
                  <span className="text-[9px] leading-none font-semibold text-muted">+{charges.length - MAX_DOTS}</span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-line">
        <p className="eyebrow mb-2 first-letter:uppercase">{selectedLabel}</p>
        {selectedCharges.length === 0 ? (
          <p className="text-sm text-muted">Nada é cobrado neste dia.</p>
        ) : (
          <ul className="space-y-2.5">
            {selectedCharges.map(({ sub, amount }) => (
              <li key={sub.id} className="flex items-center gap-3">
                <ServiceMark name={sub.name} color={sub.color} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{sub.name}</p>
                  <p className="text-xs text-muted truncate">
                    {sub.plan} · {sub.cycle === "yearly" ? "anual" : "mensal"}
                  </p>
                </div>
                <p className="num text-sm font-semibold text-ink">{formatCurrency(amount)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function NavButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
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
