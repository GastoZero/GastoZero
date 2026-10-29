import { Router } from "express"
import { CURRENCY_CODES, type CurrencyCode } from "../currencies.js"

const router = Router()

type Rates = Record<CurrencyCode, number>

/** Quanto vale 1 BRL em cada moeda. Usado quando a API de cotações está fora do ar. */
const FALLBACK_RATES: Rates = { BRL: 1, USD: 0.19, EUR: 0.17, GBP: 0.14, JPY: 29.5, CNY: 1.25 }

const SOURCE_URL = "https://open.er-api.com/v6/latest/BRL"
const CACHE_MS = 12 * 60 * 60 * 1000

let cache: { rates: Rates; updatedAt: string; fetchedAt: number } | null = null

async function fetchRates(): Promise<{ rates: Rates; updatedAt: string }> {
  const res = await fetch(SOURCE_URL, { signal: AbortSignal.timeout(5000) })
  if (!res.ok) throw new Error(`Cotações indisponíveis (${res.status})`)
  const data = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_unix?: number }
  if (data.result !== "success" || !data.rates) throw new Error("Resposta de cotações inválida")

  const rates = { ...FALLBACK_RATES }
  for (const code of CURRENCY_CODES) {
    const rate = data.rates[code]
    if (typeof rate === "number" && rate > 0) rates[code] = rate
  }
  const updatedAt = data.time_last_update_unix
    ? new Date(data.time_last_update_unix * 1000).toISOString()
    : new Date().toISOString()
  return { rates, updatedAt }
}

/** Cotações com base em BRL, guardadas em memória por 12h. */
router.get("/", async (_req, res) => {
  if (!cache || Date.now() - cache.fetchedAt > CACHE_MS) {
    try {
      cache = { ...(await fetchRates()), fetchedAt: Date.now() }
    } catch (err) {
      console.warn("Falha ao buscar cotações:", err)
      // Mantém a última cotação válida; sem nenhuma, devolve os valores de referência.
      if (!cache) return res.json({ base: "BRL", rates: FALLBACK_RATES, updatedAt: null })
    }
  }
  res.json({ base: "BRL", rates: cache.rates, updatedAt: cache.updatedAt })
})

export default router
