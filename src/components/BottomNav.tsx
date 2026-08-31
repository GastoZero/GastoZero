import {
  LayoutDashboard,
  CreditCard,
  Grid3X3,
  Calculator,
  Bell,
  Settings,
} from "lucide-react"
import type { Page } from "../types"

interface Props {
  currentPage: Page
  navigate: (p: Page) => void
}

const navItems: { label: string; page: Page; icon: typeof LayoutDashboard }[] = [
  { label: "Início", page: "dashboard", icon: LayoutDashboard },
  { label: "Assinaturas", page: "subscriptions", icon: CreditCard },
  { label: "Catálogo", page: "catalog", icon: Grid3X3 },
  { label: "Simulador", page: "simulator", icon: Calculator },
  { label: "Alertas", page: "alerts", icon: Bell },
  { label: "Config.", page: "settings", icon: Settings },
]

export default function BottomNav({ currentPage, navigate }: Props) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 safe-b">
      <div className="flex">
        {navItems.map(({ label, page, icon: Icon }) => {
          const active = currentPage === page
          return (
            <button
              key={page}
              onClick={() => navigate(page)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors cursor-pointer ${
                active ? "text-green-600" : "text-slate-400"
              }`}
            >
              <Icon size={20} className={active ? "text-green-600" : "text-slate-400"} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
