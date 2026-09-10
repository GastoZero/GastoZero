import { useMemo, useState } from "react"
import type { Page, StoredSubscription, Subscription, UserProfile } from "./types"
import { enrichSubscription, toISODate } from "./lib/format"
import { clearStoredState, usePersistentState } from "./lib/storage"
import { clearToken } from "./lib/api"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Subscriptions from "./pages/Subscriptions"
import Catalog from "./pages/Catalog"
import Simulator from "./pages/Simulator"
import Alerts from "./pages/Alerts"
import Settings from "./pages/Settings"
import Sidebar from "./components/Sidebar"
import BottomNav from "./components/BottomNav"

/** Dados de demonstração com vencimentos relativos à data atual. */
function seedSubscriptions(): StoredSubscription[] {
  const inDays = (days: number) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return toISODate(d)
  }

  return [
    { id: 1, name: "Netflix", plan: "Premium", category: "Streaming", price: 59.90, cycle: "monthly", nextBilling: inDays(1), status: "active", icon: "🎬" },
    { id: 2, name: "Spotify", plan: "Individual", category: "Música", price: 21.90, cycle: "monthly", nextBilling: inDays(8), status: "active", icon: "🎵" },
    { id: 3, name: "iCloud+", plan: "200 GB", category: "Cloud", price: 10.90, cycle: "monthly", nextBilling: inDays(3), status: "active", icon: "☁️" },
    { id: 4, name: "Academia", plan: "Mensal", category: "Academia", price: 99.90, cycle: "monthly", nextBilling: inDays(13), status: "active", icon: "💪" },
    { id: 5, name: "YouTube Premium", plan: "Individual", category: "Streaming", price: 24.90, cycle: "monthly", nextBilling: inDays(18), status: "active", icon: "▶️" },
    { id: 6, name: "Microsoft 365", plan: "Personal (anual)", category: "Software", price: 379.00, cycle: "yearly", nextBilling: inDays(23), status: "active", icon: "💻" },
    { id: 7, name: "Amazon Prime", plan: "Mensal", category: "Streaming", price: 19.90, cycle: "monthly", nextBilling: inDays(28), status: "active", icon: "📦" },
    { id: 8, name: "Plano de celular", plan: "Controle", category: "Telefonia", price: 59.99, cycle: "monthly", nextBilling: inDays(6), status: "active", icon: "📱" },
  ]
}

const DEFAULT_PROFILE: UserProfile = { name: "Admin", email: "admin@email.com" }

type AuthPage = "login" | "register"

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = usePersistentState("auth", false)
  const [profile, setProfile] = usePersistentState<UserProfile>("profile", DEFAULT_PROFILE)
  const [stored, setStored] = usePersistentState<StoredSubscription[]>(
    "subscriptions",
    seedSubscriptions,
  )
  const [authPage, setAuthPage] = useState<AuthPage>("login")
  const [page, setPage] = useState<Page>("dashboard")

  const subscriptions: Subscription[] = useMemo(
    () => stored.map(sub => enrichSubscription(sub)),
    [stored],
  )

  if (!isLoggedIn) {
    return authPage === "login" ? (
      <Login
        onLogin={user => {
          setProfile({ name: user.name, email: user.email })
          setIsLoggedIn(true)
        }}
        onRegister={() => setAuthPage("register")}
      />
    ) : (
      <Register
        onRegister={user => {
          setProfile({ name: user.name, email: user.email })
          setIsLoggedIn(true)
        }}
        onLogin={() => setAuthPage("login")}
      />
    )
  }

  const navigate = (p: Page) => setPage(p)

  const addSubscription = (sub: Omit<StoredSubscription, "id">) =>
    setStored(prev => [...prev, { ...sub, id: Date.now() }])

  const updateSubscription = (id: number, updates: Partial<StoredSubscription>) =>
    setStored(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)))

  const removeSubscription = (id: number) => setStored(prev => prev.filter(s => s.id !== id))

  const pages: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard subscriptions={subscriptions} profile={profile} navigate={navigate} />,
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
    settings: (
      <Settings
        profile={profile}
        onSaveProfile={setProfile}
        onLogout={() => {
          clearStoredState()
          clearToken()
          setProfile(DEFAULT_PROFILE)
          setStored(seedSubscriptions())
          setIsLoggedIn(false)
          setAuthPage("login")
          setPage("dashboard")
        }}
      />
    ),
  }

  const upcomingAlerts = subscriptions.filter(s => s.status === "active" && s.daysUntil <= 3).length

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden">
      <Sidebar
        currentPage={page}
        navigate={navigate}
        profile={profile}
        alertCount={upcomingAlerts}
      />
      <main className="flex-1 md:ml-64 overflow-y-auto">
        {pages[page]}
      </main>
      <BottomNav currentPage={page} navigate={navigate} />
    </div>
  )
}
