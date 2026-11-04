export const CYCLES = ["weekly", "monthly", "yearly"] as const

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const FIELDS = ["name", "plan", "category", "price", "cycle", "nextBilling", "status", "color"] as const
const OPTIONAL = new Set<string>(["status", "color"])

export type Fields = Partial<Record<(typeof FIELDS)[number], unknown>>

/** Valida e filtra os campos do corpo. Com `partial`, só checa o que foi enviado. */
export function parseFields(body: unknown, partial: boolean): { data: Fields } | { error: string } {
  const src = (body ?? {}) as Record<string, unknown>
  const data: Fields = {}

  for (const key of FIELDS) {
    if (src[key] === undefined) {
      if (!partial && !OPTIONAL.has(key)) return { error: `Campo "${key}" é obrigatório.` }
      continue
    }
    data[key] = src[key]
  }

  for (const key of ["name", "plan", "category"] as const) {
    if (key in data && (typeof data[key] !== "string" || !(data[key] as string).trim())) {
      return { error: `Campo "${key}" inválido.` }
    }
  }
  if ("price" in data && (typeof data.price !== "number" || !Number.isFinite(data.price) || data.price < 0)) {
    return { error: "Preço inválido." }
  }
  if ("cycle" in data && !(CYCLES as readonly unknown[]).includes(data.cycle)) {
    return { error: "Ciclo inválido." }
  }
  if ("status" in data && data.status !== "active" && data.status !== "paused") {
    return { error: "Status inválido." }
  }
  if ("nextBilling" in data && (typeof data.nextBilling !== "string" || !ISO_DATE_RE.test(data.nextBilling))) {
    return { error: "Data de cobrança inválida (use AAAA-MM-DD)." }
  }
  if ("color" in data && typeof data.color !== "string") {
    return { error: "Cor inválida." }
  }

  return { data }
}

/**
 * Monta o $set de uma edição: mudar o preço torna a assinatura personalizada,
 * e mudar serviço, plano ou ciclo desfaz o vínculo com o catálogo.
 */
export function updatesFor(data: Fields): Record<string, unknown> {
  const updates: Record<string, unknown> = { ...data }
  if ("price" in data) updates.priceMode = "custom"
  if ("name" in data || "plan" in data || "cycle" in data) {
    updates.catalogServiceId = null
    updates.priceMode = "custom"
  }
  return updates
}
