import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ChevronRight, Home, MoreVertical } from "lucide-react"
import type { Page, UserProfile } from "../types"
import Avatar from "./Avatar"
import Logo from "./Logo"
import { NAV_ITEMS, backTarget, breadcrumb, navSection } from "./nav"

interface Props {
  currentPage: Page
  navigate: (p: Page) => void
  profile: UserProfile
  alertCount: number
}

/** Barra superior: breadcrumb no desktop; voltar + título + menu de três pontos no mobile. */
export default function TopBar({ currentPage, navigate, profile, alertCount }: Props) {
  const crumbs = breadcrumb(currentPage, profile.role)
  const back = backTarget(currentPage, profile.role)
  const current = crumbs[crumbs.length - 1]

  return (
    <header className="print:hidden sticky top-0 z-20 bg-canvas/85 backdrop-blur border-b border-line">
      {/* Desktop: breadcrumb */}
      <nav aria-label="Você está em" className="hidden md:flex items-center h-14 px-10">
        <ol className="flex items-center gap-1.5 text-sm min-w-0">
          {crumbs.map((crumb, i) => {
            const last = i === crumbs.length - 1
            return (
              <li key={crumb.page} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && <ChevronRight size={14} className="text-line-strong flex-shrink-0" aria-hidden="true" />}
                {last ? (
                  <span aria-current="page" className="flex items-center gap-1.5 font-semibold text-ink truncate">
                    {i === 0 && <Home size={15} className="text-brand" aria-hidden="true" />}
                    {crumb.label}
                  </span>
                ) : (
                  <button
                    onClick={() => navigate(crumb.page)}
                    className="flex items-center gap-1.5 rounded-md px-1.5 py-1 -mx-1.5 font-medium text-muted hover:text-ink hover:bg-sunken transition-colors cursor-pointer truncate"
                  >
                    {i === 0 && <Home size={15} aria-hidden="true" />}
                    {crumb.label}
                  </button>
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Mobile: voltar + título + menu */}
      <div
        className="md:hidden flex items-center gap-1 h-14 px-2"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)", boxSizing: "content-box" }}
      >
        {back ? (
          <>
            <button
              onClick={() => navigate(back)}
              aria-label="Voltar"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-ink hover:bg-sunken transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <p className="flex-1 min-w-0 truncate font-semibold text-ink">{current.label}</p>
          </>
        ) : (
          <div className="flex-1 pl-2">
            <Logo size={26} />
          </div>
        )}
        <MobileMenu currentPage={currentPage} navigate={navigate} profile={profile} alertCount={alertCount} />
      </div>
    </header>
  )
}

function MobileMenu({ currentPage, navigate, profile, alertCount }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const section = navSection(currentPage)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointer)
    }
  }, [open])

  const go = (p: Page) => {
    setOpen(false)
    navigate(p)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Abrir menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`relative w-10 h-10 rounded-lg flex items-center justify-center text-ink transition-colors cursor-pointer ${
          open ? "bg-sunken" : "hover:bg-sunken"
        }`}
      >
        <MoreVertical size={20} />
        {alertCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger ring-2 ring-canvas" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-line bg-surface shadow-xl overflow-hidden"
        >
          <button
            role="menuitem"
            onClick={() => go("settings")}
            className="w-full flex items-center gap-3 px-4 py-3 border-b border-line text-left hover:bg-sunken transition-colors cursor-pointer"
          >
            <Avatar name={profile.name} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{profile.name}</p>
              <p className="text-xs text-muted truncate">{profile.email}</p>
            </div>
          </button>

          <div className="p-1.5">
            {NAV_ITEMS[profile.role].map(({ label, page, icon: Icon }) => {
              const active = section === page
              return (
                <button
                  key={page}
                  role="menuitem"
                  onClick={() => go(page)}
                  aria-current={active ? "page" : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                    active ? "bg-sunken text-ink font-semibold" : "text-ink-2 hover:bg-sunken/60 font-medium"
                  }`}
                >
                  <Icon size={17} strokeWidth={active ? 2.2 : 1.8} className={active ? "text-brand" : "text-muted"} />
                  {label}
                  {page === "alerts" && alertCount > 0 && (
                    <span className="ml-auto num min-w-5 h-5 px-1.5 bg-danger text-white text-[11px] rounded-full flex items-center justify-center font-semibold">
                      {alertCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
