import { Bell, Calculator, CreditCard, LayoutDashboard, Settings } from "lucide-react"
import type { Page } from "../types"

export const NAV_ITEMS: { label: string; short: string; page: Page; icon: typeof LayoutDashboard }[] = [
  { label: "Visão geral", short: "Início", page: "dashboard", icon: LayoutDashboard },
  { label: "Assinaturas", short: "Assinaturas", page: "subscriptions", icon: CreditCard },
  { label: "Simulador", short: "Simulador", page: "simulator", icon: Calculator },
  { label: "Alertas", short: "Alertas", page: "alerts", icon: Bell },
  { label: "Configurações", short: "Ajustes", page: "settings", icon: Settings },
]

/** O catálogo é uma subpágina de Assinaturas: mantém o item destacado no menu. */
export const navSection = (page: Page): Page => (page === "catalog" ? "subscriptions" : page)
