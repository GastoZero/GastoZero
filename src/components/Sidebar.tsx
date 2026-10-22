import type { Page, ThemePreference, UserProfile } from "../types"
import Avatar from "./Avatar"
import Logo from "./Logo"
import ThemeSwitch from "./ThemeSwitch"
import { NAV_ITEMS, navSection } from "./nav"

interface Props {
  currentPage: Page
  navigate: (p: Page) => void
  profile: UserProfile
  alertCount: number
  theme: ThemePreference
  onThemeChange: (t: ThemePreference) => void
}

export default function Sidebar({ currentPage, navigate, profile, alertCount, theme, onThemeChange }: Props) {
  const section = navSection(currentPage)
  const isAdmin = profile.role === "admin"

  return (
    <aside className="hidden md:flex print:hidden fixed left-0 top-0 h-full w-64 bg-surface border-r border-line flex-col z-30">
      <div className="px-6 pt-7 pb-8">
        <Logo />
      </div>

      <p className="eyebrow px-6 mb-2">{isAdmin ? "Administração" : "Menu"}</p>
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS[profile.role].map(({ label, page, icon: Icon }) => {
          const active = section === page
          return (
            <button
              key={page}
              onClick={() => navigate(page)}
              aria-current={active ? "page" : undefined}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                active ? "bg-sunken text-ink font-semibold" : "text-ink-2 hover:bg-sunken/60 hover:text-ink font-medium"
              }`}
            >
              {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-brand" />}
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} className={active ? "text-brand" : "text-muted"} />
              {label}
              {page === "alerts" && alertCount > 0 && (
                <span className="ml-auto num min-w-5 h-5 px-1.5 bg-ink text-canvas text-[11px] rounded-full flex items-center justify-center font-semibold">
                  {alertCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="px-4 pb-3">
        <ThemeSwitch value={theme} onChange={onThemeChange} />
      </div>

      <button
        onClick={() => navigate("settings")}
        className="mx-3 mb-3 flex items-center gap-3 rounded-lg px-3 py-3 border-t border-line hover:bg-sunken transition-colors text-left cursor-pointer"
      >
        <Avatar name={profile.name} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink truncate">{profile.name}</p>
          <p className="text-xs text-muted truncate">{profile.email}</p>
        </div>
      </button>
    </aside>
  )
}
