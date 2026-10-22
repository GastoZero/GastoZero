import type { Page, UserRole } from "../types"
import { NAV_ITEMS, navSection } from "./nav"

interface Props {
  currentPage: Page
  navigate: (p: Page) => void
  alertCount: number
  role: UserRole
}

export default function BottomNav({ currentPage, navigate, alertCount, role }: Props) {
  const section = navSection(currentPage)

  return (
    <nav
      className="md:hidden print:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur border-t border-line z-30"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex">
        {NAV_ITEMS[role].map(({ short, page, icon: Icon }) => {
          const active = section === page
          return (
            <button
              key={page}
              onClick={() => navigate(page)}
              aria-current={active ? "page" : undefined}
              className={`relative flex-1 flex flex-col items-center gap-1 pt-2.5 pb-2 text-[10.5px] font-medium transition-colors cursor-pointer ${
                active ? "text-ink" : "text-muted"
              }`}
            >
              {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b bg-brand" />}
              <span className="relative">
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} className={active ? "text-brand" : ""} />
                {page === "alerts" && alertCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-danger ring-2 ring-surface" />
                )}
              </span>
              {short}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
