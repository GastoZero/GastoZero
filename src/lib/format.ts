import type { BillingCycle, CurrencyCode, ExchangeRates, StoredSubscription, Subscription } from "../types"

export const CURRENCIES: { code: CurrencyCode; name: string }[] = [
  { code: "BRL", name: "Real brasileiro" },
  { code: "USD", name: "Dólar americano" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "Libra esterlina" },
  { code: "JPY", name: "Iene japonês" },
  { code: "CNY", name: "Yuan chinês" },
]

/** Valores de referência usados até a cotação do servidor chegar (ou se ela falhar). */
export const FALLBACK_RATES: ExchangeRates = { BRL: 1, USD: 0.19, EUR: 0.17, GBP: 0.14, JPY: 29.5, CNY: 1.25 }

const formatterFor = (code: CurrencyCode) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: code })

export const currencySymbol = (code: CurrencyCode) =>
  formatterFor(code).formatToParts(0).find(p => p.type === "currency")?.value ?? code

/**
 * Moeda de exibição do usuário logado. Todos os valores trafegam em BRL e são
 * convertidos só na hora de mostrar; o App chama `setDisplayCurrency` ao renderizar.
 */
let display = { code: "BRL" as CurrencyCode, rate: 1, formatter: formatterFor("BRL") }

export function setDisplayCurrency(code: CurrencyCode, rates: ExchangeRates) {
  if (display.code === code && display.rate === rates[code]) return
  display = { code, rate: rates[code] ?? 1, formatter: formatterFor(code) }
}

export const displayCurrency = () => display.code

/** BRL → moeda de exibição. */
export const toDisplay = (brl: number) => brl * display.rate

/** Moeda de exibição → BRL (para salvar o que o usuário digitou). */
export const fromDisplay = (value: number) => value / display.rate

/** Recebe um valor em BRL e formata na moeda escolhida pelo usuário. */
export const formatCurrency = (brl: number) => display.formatter.format(toDisplay(brl))

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

/** Data ISO completa (ex.: createdAt) em dd/mm/aaaa. */
export const formatDate = (iso: string) => new Date(iso).toLocaleDateString("pt-BR")
