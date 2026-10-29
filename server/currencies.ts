/** Moedas aceitas na preferência do usuário. Os valores continuam salvos em BRL. */
export const CURRENCY_CODES = ["BRL", "USD", "EUR", "GBP", "JPY", "CNY"] as const

export type CurrencyCode = (typeof CURRENCY_CODES)[number]

export const isCurrencyCode = (value: unknown): value is CurrencyCode =>
  typeof value === "string" && (CURRENCY_CODES as readonly string[]).includes(value)
