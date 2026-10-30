import { useCallback, useEffect, useMemo, useState } from "react"
import type { ExchangeRates, Page, StoredSubscription, Subscription, ThemePreference, UserProfile } from "./types"
import { enrichSubscription, FALLBACK_RATES, setDisplayCurrency } from "./lib/format"
import { clearStoredState, usePersistentState } from "./lib/storage"
import * as api from "./lib/api"
import { useAppliedTheme } from "./lib/theme"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Subscriptions from "./pages/Subscriptions"
import Catalog from "./pages/Catalog"
import Simulator from "./pages/Simulator"
import Alerts from "./pages/Alerts"
import Settings from "./pages/Settings"
import AdminUsers from "./pages/admin/Users"
import AdminReports from "./pages/admin/Reports"
import AdminAdmins from "./pages/admin/Admins"
import Sidebar from "./components/Sidebar"
import BottomNav from "./components/BottomNav"
import { HOME_PAGE } from "./components/nav"
import AdminCatalog from "./pages/admin/Catalog"
import AdminOverview from "./pages/admin/Overview"

type AuthPage = "login" | "register"

/** "checking": validando o token salvo · "anon": sem sessão · "error": API inacessível · "ready": logado. */
type Session = "checking" | "anon" | "error" | "ready"

function toProfile(user: api.AuthUser): UserProfile {
  return {
    name: user.name,
    email: user.email,
    role: user.role ?? "user",
    notifications: user.notifications,
    currency: user.currency ?? "BRL",
  }
}

export default function App() {
  const [session, setSession] = useState<Session>(() => (api.getToken() ? "checking" : "anon"))
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stored, setStored] = useState<StoredSubscription[]>([])
  const [rates, setRates] = useState<{ rates: ExchangeRates; updatedAt: string | null }>({
    rates: FALLBACK_RATES,
    updatedAt: null,
  })
  const [theme, setTheme] = usePersistentState<ThemePreference>("theme", "system")
  const isDark = useAppliedTheme(theme)
  const [authPage, setAuthPage] = useState<AuthPage>("login")
  const [page, setPage] = useState<Page>("dashboard")
  const [error, setError] = useState("")

  const logout = useCallback(() => {
    clearStoredState()
    api.clearToken()
    setProfile(null)
    setStored([])
    setSession("anon")
    setAuthPage("login")
    setPage("dashboard")
  }, [])

  /** Carrega usuário e assinaturas a partir do token salvo. */
  const loadSession = useCallback(async () => {
    setSession("checking")
    try {
      const [{ user }, subs] = await Promise.all([api.fetchMe(), api.listSubscriptions()])
      const nextProfile = toProfile(user)
      setProfile(nextProfile)
      setStored(subs)
      setPage(HOME_PAGE[nextProfile.role])
      setSession("ready")
    } catch (err) {
      if (err instanceof api.ApiError && err.status === 401) logout()
      else setSession("error")
    }
  }, [logout])

  useEffect(() => {
    api.setUnauthorizedHandler(logout)
    if (api.getToken()) void loadSession()
    return () => api.setUnauthorizedHandler(null)
  }, [loadSession, logout])

  // Cotação não bloqueia o login: se falhar, seguem os valores de referência.
  useEffect(() => {
    if (session !== "ready") return
    api.fetchRates().then(setRates).catch(() => {})
  }, [session])

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(""), 4000)
    return () => clearTimeout(t)
  }, [error])

  const subscriptions: Subscription[] = useMemo(
    () => stored.map(sub => enrichSubscription(sub)),
    [stored],
  )

  if (session === "checking") {
    return (
      <div className="flex h-full items-center justify-center bg-canvas text-muted text-sm">
        Carregando sua conta...
      </div>
    )
  }

  if (session === "error") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-canvas px-4 text-center">
        <p className="text-ink font-semibold">Não foi possível conectar ao servidor.</p>
        <div className="flex gap-2">
          <button onClick={() => void loadSession()} className="btn-primary">Tentar novamente</button>
          <button onClick={logout} className="btn-secondary">Sair</button>
        </div>
      </div>
    )
  }

  if (session === "anon" || !profile) {
    const onAuth = () => void loadSession()
    return authPage === "login" ? (
      <Login onLogin={onAuth} onRegister={() => setAuthPage("register")} />
    ) : (
      <Register onRegister={onAuth} onLogin={() => setAuthPage("login")} />
    )
  }

  // Precisa rodar antes dos filhos renderizarem para que `formatCurrency` já use a moeda certa.
  setDisplayCurrency(profile.currency, rates.rates)

  const navigate = (p: Page) => {
    setPage(p)
    document.querySelector("main")?.scrollTo({ top: 0 })
  }

  const fail = (err: unknown) =>
    setError(err instanceof Error ? err.message : "Não foi possível salvar a alteração.")

  const addSubscription = async (sub: api.SubscriptionInput) => {
    try {
      const created = await api.createSubscription(sub)
      setStored(prev => [...prev, created])
    } catch (err) {
      fail(err)
      throw err
    }
  }

  // Atualização otimista: aplica na tela e desfaz se a API recusar.
  const updateSubscription = async (id: string, updates: Partial<StoredSubscription>) => {
    const previous = stored
    setStored(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)))
    try {
      const saved = await api.updateSubscription(id, updates)
      setStored(prev => prev.map(s => (s.id === id ? saved : s)))
    } catch (err) {
      setStored(previous)
      fail(err)
    }
  }

  const removeSubscription = async (id: string) => {
    const previous = stored
    setStored(prev => prev.filter(s => s.id !== id))
    try {
      await api.deleteSubscription(id)
    } catch (err) {
      setStored(previous)
      fail(err)
    }
  }

  const saveProfile = async (updates: Partial<UserProfile>) => {
    const { user } = await api.updateMe(updates)
    setProfile(toProfile(user))
  }

  const settings = (
    <Settings
      profile={profile}
      onSaveProfile={saveProfile}
      rates={rates}
      theme={theme}
      onThemeChange={setTheme}
      onLogout={logout}
    />
  )

  // O perfil define o menu e quais telas existem; o servidor também barra /api/admin para não-admins.
  const adminPages: Partial<Record<Page, React.ReactNode>> = {
    "admin-overview": <AdminOverview navigate={navigate} />,
    users: <AdminUsers />,
    reports: <AdminReports isDark={isDark} />,
    "admin-catalog": <AdminCatalog />,
    admins: <AdminAdmins />,
    settings,
  }


  const userPages: Partial<Record<Page, React.ReactNode>> = {
    dashboard: <Dashboard subscriptions={subscriptions} profile={profile} navigate={navigate} isDark={isDark} />,
    subscriptions: (
      <Subscriptions
        subscriptions={subscriptions}
        update={updateSubscription}
        remove={removeSubscription}
        navigate={navigate}
      />
    ),
    catalog: (
      <Catalog
        subscriptions={subscriptions}
        addSubscription={addSubscription}
        navigate={navigate}
      />
    ),
    simulator: <Simulator subscriptions={subscriptions} navigate={navigate} />,
    alerts: <Alerts subscriptions={subscriptions} navigate={navigate} />,
    settings,
  }

  const pages = profile.role === "admin" ? adminPages : userPages

  const upcomingAlerts = subscriptions.filter(s => s.status === "active" && s.daysUntil <= 3).length

  return (
    <div className="flex h-full bg-canvas overflow-hidden print:block print:h-auto print:overflow-visible">
      <Sidebar
        currentPage={page}
        navigate={navigate}
        profile={profile}
        alertCount={upcomingAlerts}
        theme={theme}
        onThemeChange={setTheme}
      />
      <main className="flex-1 md:ml-64 overflow-y-auto print:ml-0 print:overflow-visible">
        {pages[page]}
      </main>
      <BottomNav currentPage={page} navigate={navigate} alertCount={upcomingAlerts} role={profile.role} />
      {error && (
        <div
          role="alert"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100%-2rem)] text-sm text-danger bg-danger-soft border border-line rounded-lg px-4 py-2.5 shadow-lg"
        >
          {error}
        </div>
      )}
    </div>
  )
}
