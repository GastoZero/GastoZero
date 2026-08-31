import { useState } from "react"
import { Search, Plus, MoreVertical, PauseCircle, PlayCircle, XCircle } from "lucide-react"
import type { Page, StoredSubscription, Subscription } from "../types"
import { billingLabel, cycleLabel, formatCurrency } from "../lib/format"

interface Props {
  subscriptions: Subscription[]
  update: (id: number, u: Partial<StoredSubscription>) => void
  remove: (id: number) => void
  navigate: (p: Page) => void
}

const CATEGORIES = ["Todas", "Streaming", "Música", "Cloud", "Academia", "Telefonia", "Software", "Games"]

export default function Subscriptions({ subscriptions, update, remove, navigate }: Props) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Todas")
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [confirmCancel, setConfirmCancel] = useState<number | null>(null)

  const filtered = subscriptions.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.trim().toLowerCase())
    const matchCat = activeCategory === "Todas" || s.category === activeCategory
    return matchSearch && matchCat
  })

  const active = subscriptions.filter(s => s.status === "active")
  const monthlyTotal = active.reduce((sum, s) => sum + s.monthlyPrice, 0)
  const annualTotal = monthlyTotal * 12
  const fmt = formatCurrency

  return (
    <div className="min-h-full pb-20 md:pb-6">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-5 sticky top-0 z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Minhas Assinaturas</h1>
            <p className="text-sm text-slate-500 mt-0.5">Gerencie todos os seus serviços recorrentes em um só lugar.</p>
          </div>
          <button
            onClick={() => navigate("catalog")}
            className="flex-shrink-0 flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
          >
            <Plus size={16} />
            Adicionar
          </button>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100">
          <Stat label="Assinaturas ativas" value={`${active.length}`} />
          <div className="w-px bg-slate-200" />
          <Stat label="Total mensal" value={fmt(monthlyTotal)} highlight />
          <div className="w-px bg-slate-200" />
          <Stat label="Total anual" value={fmt(annualTotal)} />
        </div>
      </header>

      <div className="px-4 md:px-8 py-5 space-y-4">
        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar assinatura..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-green-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-green-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Subscription cards */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              Nenhuma assinatura encontrada.
            </div>
          )}
          {filtered.map(sub => (
            <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-4">
                <span className="text-2xl flex-shrink-0">{sub.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800">{sub.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{sub.plan}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          sub.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {sub.status === "active" ? "Ativa" : "Pausada"}
                      </span>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === sub.id ? null : sub.id)}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenu === sub.id && (
                          <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 w-40">
                            <MenuBtn
                              icon={sub.status === "active" ? <PauseCircle size={13} /> : <PlayCircle size={13} />}
                              label={sub.status === "active" ? "Pausar" : "Retomar"}
                              onClick={() => {
                                update(sub.id, { status: sub.status === "active" ? "paused" : "active" })
                                setOpenMenu(null)
                              }}
                            />
                            <MenuBtn
                              icon={<XCircle size={13} />}
                              label="Cancelar"
                              danger
                              onClick={() => {
                                setConfirmCancel(sub.id)
                                setOpenMenu(null)
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-slate-800">
                      {fmt(sub.price)}
                      <span className="text-xs text-slate-400 font-normal">{cycleLabel(sub.cycle)}</span>
                      {sub.cycle === "yearly" && (
                        <span className="text-xs text-slate-400 font-normal"> · {fmt(sub.monthlyPrice)}/mês</span>
                      )}
                    </span>
                    <span
                      className={`text-xs ${
                        sub.status !== "active"
                          ? "text-slate-400"
                          : sub.daysUntil <= 1
                          ? "text-red-500 font-medium"
                          : sub.daysUntil <= 3
                          ? "text-amber-500 font-medium"
                          : "text-slate-400"
                      }`}
                    >
                      {sub.status === "active"
                        ? `Próxima cobrança: ${sub.nextBillingLabel} (${billingLabel(sub.daysUntil).toLowerCase()})`
                        : "Cobrança pausada"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel confirm modal */}
      {confirmCancel !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-slate-800 text-lg mb-2">Cancelar assinatura</h3>
            <p className="text-slate-500 text-sm mb-6">
              Tem certeza que deseja remover{" "}
              <strong>{subscriptions.find(s => s.id === confirmCancel)?.name}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCancel(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  remove(confirmCancel)
                  setConfirmCancel(null)
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* close menu on outside click */}
      {openMenu !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
      )}
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-sm font-bold mt-0.5 ${highlight ? "text-red-600" : "text-slate-800"}`}>{value}</p>
    </div>
  )
}

function MenuBtn({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50 transition ${danger ? "text-red-600" : "text-slate-700"}`}
    >
      {icon}
      {label}
    </button>
  )
}
