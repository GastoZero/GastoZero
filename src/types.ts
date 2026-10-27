export type BillingCycle = "monthly" | "yearly"

export type SubscriptionStatus = "active" | "paused"

/** Assinatura como é persistida na API. */
export interface StoredSubscription {
  id: string
  name: string
  plan: string
  category: string
  /** Valor cobrado a cada ciclo. */
  price: number
  cycle: BillingCycle
  /** Data da próxima cobrança no formato ISO (YYYY-MM-DD). */
  nextBilling: string
  status: SubscriptionStatus
  /** Cor da marca do serviço (hex). Quando ausente, vem do catálogo. */
  color?: string
  /** Legado: emoji usado em versões anteriores. Não é mais exibido. */
  icon?: string
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
  // Telas do administrador
  | "users"
  | "reports"
  | "admins"

export interface CatalogPlan {
  label: string
  price: number
  cycle: BillingCycle
  priceUpdatedAt?: string
}


export interface CatalogService {
  id: number
  name: string
  category: string
  color: string
  plans: CatalogPlan[]
}

export type ThemePreference = "light" | "dark" | "system"

export interface NotificationPrefs {
  billing: boolean
  renewal: boolean
}

export type UserRole = "user" | "admin"

export interface UserProfile {
  name: string
  email: string
  role: UserRole
  notifications: NotificationPrefs
}

/** Conta listada no painel do administrador. */
export interface AccountSummary {
  id: string
  name: string
  email: string
  /** Data de cadastro em ISO. */
  createdAt: string
}

export interface AdminUser extends AccountSummary {
  subscriptions: number
  /** Soma mensal das assinaturas ativas. */
  monthlyTotal: number
}

export interface StatGroup {
  name: string
  count: number
  /** Gasto mensal somado. */
  value: number
}

/** Novos cadastros em um mês (mês no formato YYYY-MM). */
export interface GrowthPoint {
  month: string
  users: number
  subscriptions: number
}

export interface AdminStats {
  users: number
  payingUsers: number
  activeSubscriptions: number
  monthlyTotal: number
  avgPerUser: number
  byCategory: StatGroup[]
  services: StatGroup[]
  /** Últimos meses, do mais antigo ao atual. */
  growth: GrowthPoint[]
}
