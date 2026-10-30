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
