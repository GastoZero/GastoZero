import {
  LayoutDashboard,
  CreditCard,
  Grid3X3,
  Calculator,
  Bell,
  Settings,
  Zap,
} from "lucide-react"
import type { Page, UserProfile } from "../types"

interface Props {
  currentPage: Page
  navigate: (p: Page) => void
  profile: UserProfile
  alertCount: number
}

const navItems: { label: string; page: Page; icon: typeof LayoutDashboard }[] = [
  { label: "Visão Geral", page: "dashboard", icon: LayoutDashboard },
  { label: "Minhas Assinaturas", page: "subscriptions", icon: CreditCard },
  { label: "Catálogo", page: "catalog", icon: Grid3X3 },
  { label: "Simulador", page: "simulator", icon: Calculator },
  { label: "Alertas", page: "alerts", icon: Bell },
  { label: "Configurações", page: "settings", icon: Settings },
]

export default function Sidebar({ currentPage, navigate, profile, alertCount }: Props) {
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex-col z-30">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-200">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
          <Zap size={16} className="text-white" fill="white" />
        </div>
        <span className="font-bold text-xl text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>
          GastoZero
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, page, icon: Icon }) => {
          const active = currentPage === page
          return (
            <button
              key={page}
              onClick={() => navigate(page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                active
                  ? "bg-green-50 text-green-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon
                size={18}
                className={active ? "text-green-600" : "text-slate-400"}
              />
              {label}
              {page === "alerts" && alertCount > 0 && (
                <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {alertCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
            {(profile.name.trim()[0] ?? "?").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{profile.name}</p>
            <p className="text-xs text-slate-500 truncate">{profile.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
