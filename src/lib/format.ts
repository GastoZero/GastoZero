import type { BillingCycle, StoredSubscription, Subscription } from "../types"

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

export const formatCurrency = (value: number) => currency.format(value)

/** Converte "YYYY-MM-DD" em Date local (evita o deslocamento de fuso do construtor ISO). */
export function parseISODate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null
  const [, y, m, d] = match
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return Number.isNaN(date.getTime()) ? null : date
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  const day = result.getDate()
  result.setDate(1)
  result.setMonth(result.getMonth() + months)
  // Ajusta meses mais curtos (ex.: 31/01 + 1 mês → 28/02).
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()
  result.setDate(Math.min(day, lastDay))
  return result
}

export function daysBetween(from: Date, to: Date): number {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  return Math.round((startOfDay(to) - startOfDay(from)) / 86_400_000)
}

export function formatShortDate(iso: string): string {
  const date = parseISODate(iso)
  if (!date) return "—"
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

export const monthlyCost = (price: number, cycle: BillingCycle) =>
  cycle === "yearly" ? price / 12 : price

export const cycleLabel = (cycle: BillingCycle) => (cycle === "yearly" ? "/ano" : "/mês")

/**
 * Rola a data de cobrança para frente até cair no futuro e adiciona os campos
 * derivados usados nas telas.
 */
export function enrichSubscription(sub: StoredSubscription, today = new Date()): Subscription {
  const step = sub.cycle === "yearly" ? 12 : 1
  let date = parseISODate(sub.nextBilling)

  if (date) {
    let guard = 0
    while (daysBetween(today, date) < 0 && guard < 240) {
      date = addMonths(date, step)
      guard++
    }
  }

  const nextBilling = date ? toISODate(date) : sub.nextBilling

  return {
    ...sub,
    nextBilling,
    monthlyPrice: monthlyCost(sub.price, sub.cycle),
    daysUntil: date ? daysBetween(today, date) : Number.POSITIVE_INFINITY,
    nextBillingLabel: date ? formatShortDate(nextBilling) : "—",
  }
}

export function billingLabel(daysUntil: number): string {
  if (!Number.isFinite(daysUntil)) return "Sem data"
  if (daysUntil <= 0) return "Hoje"
  if (daysUntil === 1) return "Amanhã"
  return `Em ${daysUntil} dias`
}
