import { BarChart3, Bell, Calculator, CreditCard, LayoutDashboard, Settings, ShieldCheck, Users } from "lucide-react"
import type { Page, UserRole } from "../types"

export interface NavItem {
  label: string
  short: string
  page: Page
  icon: typeof LayoutDashboard
}

const SETTINGS: NavItem = { label: "Configurações", short: "Ajustes", page: "settings", icon: Settings }

export const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  user: [
    { label: "Visão geral", short: "Início", page: "dashboard", icon: LayoutDashboard },
    { label: "Assinaturas", short: "Assinaturas", page: "subscriptions", icon: CreditCard },
    { label: "Simulador", short: "Simulador", page: "simulator", icon: Calculator },
    { label: "Relatórios", short: "Relatórios", page: "reports", icon: BarChart3 },
    { label: "Alertas", short: "Alertas", page: "alerts", icon: Bell },
    SETTINGS,
  ],
  
  admin: [
    {
      label: "Visão geral",
      short: "Início",
      page: "admin-overview",
      icon: LayoutDashboard
    },
    {
      label: "Usuários",
      short: "Usuários",
      page: "users",
      icon: Users
    },
    {
      label: "Relatórios",
      short: "Relatórios",
      page: "reports",
      icon: BarChart3
    },
    {
      label: "Assinaturas",
      short: "Assinaturas",
      page: "admin-catalog",
      icon: CreditCard
    },
    {
      label: "Administradores",
      short: "Admins",
      page: "admins",
      icon: ShieldCheck
    },
    SETTINGS,
  ],

}

/** Primeira tela de cada perfil após o login. */
export const HOME_PAGE: Record<UserRole, Page> = {
  user: "dashboard",
  admin: "admin-overview"
}

/** O catálogo é uma subpágina de Assinaturas: mantém o item destacado no menu. */
export const navSection = (page: Page): Page => (page === "catalog" ? "subscriptions" : page)

/** Subpáginas que não aparecem no menu, com a tela "mãe" e o rótulo usado no breadcrumb. */
const SUBPAGES: Partial<Record<Page, { parent: Page; label: string }>> = {
  catalog: { parent: "subscriptions", label: "Nova assinatura" },
}

export interface Crumb {
  page: Page
  label: string
}

const pageLabel = (page: Page, role: UserRole): string =>
  SUBPAGES[page]?.label ?? NAV_ITEMS[role].find(item => item.page === page)?.label ?? ""

/** Caminho da tela inicial até a página atual, ex.: Visão geral › Assinaturas › Nova assinatura. */
export function breadcrumb(page: Page, role: UserRole): Crumb[] {
  const chain: Page[] = []
  for (let p: Page | undefined = page; p; p = SUBPAGES[p]?.parent) chain.unshift(p)
  if (chain[0] !== HOME_PAGE[role]) chain.unshift(HOME_PAGE[role])
  return chain.map(p => ({ page: p, label: pageLabel(p, role) }))
}

/** Para onde o botão "voltar" leva: a tela mãe, ou a inicial. `null` quando já está na inicial. */
export function backTarget(page: Page, role: UserRole): Page | null {
  if (page === HOME_PAGE[role]) return null
  return SUBPAGES[page]?.parent ?? HOME_PAGE[role]
}
