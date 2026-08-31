export type BillingCycle = "monthly" | "yearly"

export type SubscriptionStatus = "active" | "paused"

/** Assinatura como é persistida (localStorage / futura API REST). */
export interface StoredSubscription {
  id: number
  name: string
  plan: string
  category: string
  /** Valor cobrado a cada ciclo. */
  price: number
  cycle: BillingCycle
  /** Data da próxima cobrança no formato ISO (YYYY-MM-DD). */
  nextBilling: string
  status: SubscriptionStatus
  icon: string
}

/** Assinatura enriquecida com os campos derivados usados na interface. */
export interface Subscription extends StoredSubscription {
  /** Custo normalizado por mês (planos anuais são divididos por 12). */
  monthlyPrice: number
  daysUntil: number
  /** Próxima cobrança formatada como dd/mm. */
  nextBillingLabel: string
}

export type Page =
  | "dashboard"
  | "subscriptions"
  | "catalog"
  | "simulator"
  | "alerts"
  | "settings"

export interface CatalogPlan {
  label: string
  price: number
  cycle: BillingCycle
}

export interface CatalogService {
  id: number
  name: string
  category: string
  icon: string
  color: string
  plans: CatalogPlan[]
}

export interface UserProfile {
  name: string
  email: string
}
