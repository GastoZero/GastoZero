import { useState } from "react"
import { Search, Plus, MoreHorizontal, Pause, Play, Trash2, ArrowUpRight } from "lucide-react"
import type { Page, StoredSubscription, Subscription } from "../types"
import { billingLabel, cycleLabel, formatCurrency } from "../lib/format"
import PageHeader from "../components/PageHeader"
import ServiceMark from "../components/ServiceMark"

interface Props {
  subscriptions: Subscription[]
  update: (id: number, u: Partial<StoredSubscription>) => void
  remove: (id: number) => void
  navigate: (p: Page) => void
}

export default function Subscriptions({ subscriptions, update, remove, navigate }: Props) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Todas")
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [confirmCancel, setConfirmCancel] = useState<number | null>(null)

  const categories = ["Todas", ...Array.from(new Set(subscriptions.map(s => s.category))).sort()]

  const filtered = subscriptions
    .filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.trim().toLowerCase())
      const matchCat = activeCategory === "Todas" || s.category === activeCategory
      return matchSearch && matchCat
    })
    .sort((a, b) => (a.status === b.status ? a.daysUntil - b.daysUntil : a.status === "active" ? -1 : 1))

  const active = subscriptions.filter(s => s.status === "active")
  const monthlyTotal = active.reduce((sum, s) => sum + s.monthlyPrice, 0)
  const fmt = formatCurrency
  const toCancel = subscriptions.find(s => s.id === confirmCancel)

  return (
    <div className="min-h-full pb-24 md:pb-10">
      <PageHeader
        eyebrow="Gestão"
        title="Assinaturas"
        description="Tudo o que é cobrado de você todo mês ou todo ano, em um lugar só."
        actions={
          <button onClick={() => navigate("catalog")} className="btn-primary">
            <Plus size={16} strokeWidth={2.4} />
            Nova assinatura
          </button>
        }
      />

      <div className="px-4 md:px-10 space-y-5">
        <div className="card grid grid-cols-3 divide-x divide-line">
          <Stat label="Ativas" value={String(active.length)} />
          <Stat label="Por mês" value={fmt(monthlyTotal)} strong />
          <Stat label="Por ano" value={fmt(monthlyTotal * 12)} />
        </div>

        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative lg:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar pelo nome"
              className="input pl-10"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={activeCategory === cat ? "chip-on" : "chip-off"}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {subscriptions.length === 0 ? (
          <div className="card border-dashed p-10 text-center">
            <p className="font-display text-lg font-semibold text-ink">Nenhuma assinatura ainda</p>
            <p className="text-sm text-muted mt-1 mb-5">Comece escolhendo um serviço do catálogo: o preço já vem preenchido.</p>
            <button onClick={() => navigate("catalog")} className="btn-primary">
              Explorar catálogo <ArrowUpRight size={15} />
            </button>
          </div>
        ) : (
          <div className="card overflow-visible">
            <div className="hidden md:grid grid-cols-[minmax(0,1fr)_140px_150px_130px_40px] gap-4 px-5 py-3 border-b border-line eyebrow">
              <span>Serviço</span>
              <span>Categoria</span>
              <span>Próxima cobrança</span>
              <span className="text-right">Valor</span>
              <span />
            </div>

            {filtered.length === 0 && (
              <p className="text-center py-12 text-muted text-sm">Nada encontrado com esses filtros.</p>
            )}

            <ul className="divide-y divide-line">
              {filtered.map(sub => {
                const paused = sub.status !== "active"
                const dueTone = paused
                  ? "text-muted"
                  : sub.daysUntil <= 1
                    ? "text-danger font-semibold"
                    : sub.daysUntil <= 3
                      ? "text-warn font-semibold"
                      : "text-ink-2"
                return (
                  <li
                    key={sub.id}
                    className={`grid grid-cols-[minmax(0,1fr)_auto_40px] md:grid-cols-[minmax(0,1fr)_140px_150px_130px_40px] gap-x-4 gap-y-1 items-center px-4 md:px-5 py-3.5 ${
                      paused ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ServiceMark name={sub.name} color={sub.color} />
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate">{sub.name}</p>
                        <p className="text-xs text-muted truncate">
                          {sub.plan}
                          {paused && <span className="ml-1.5 text-warn font-semibold">· Pausada</span>}
                        </p>
                        <p className={`md:hidden text-xs mt-0.5 ${dueTone}`}>
                          {paused ? "Cobrança pausada" : `${sub.nextBillingLabel} · ${billingLabel(sub.daysUntil).toLowerCase()}`}
                        </p>
                      </div>
                    </div>

                    <span className="hidden md:block text-sm text-ink-2">{sub.category}</span>

                    <span className={`hidden md:block text-sm ${dueTone}`}>
                      {paused ? (
                        "Pausada"
                      ) : (
                        <>
                          <span className="num">{sub.nextBillingLabel}</span>
                          <span className="text-xs ml-1.5 opacity-80">{billingLabel(sub.daysUntil).toLowerCase()}</span>
                        </>
                      )}
                    </span>

                    <div className="text-right">
                      <p className="num font-semibold text-ink">
                        {fmt(sub.price)}
                        <span className="text-xs text-muted font-normal">{cycleLabel(sub.cycle)}</span>
                      </p>
                      {sub.cycle === "yearly" && (
                        <p className="num text-[11px] text-muted">{fmt(sub.monthlyPrice)}/mês</p>
                      )}
                    </div>

                    <div className="relative justify-self-end">
                      <button
                        onClick={() => setOpenMenu(openMenu === sub.id ? null : sub.id)}
                        aria-label={`Ações de ${sub.name}`}
                        className="w-8 h-8 rounded-lg hover:bg-sunken flex items-center justify-center text-muted hover:text-ink transition-colors cursor-pointer"
                      >
                        <MoreHorizontal size={17} />
                      </button>
                      {openMenu === sub.id && (
                        <div className="absolute right-0 top-9 card shadow-xl shadow-black/10 z-20 p-1 w-44">
                          <MenuBtn
                            icon={paused ? <Play size={14} /> : <Pause size={14} />}
                            label={paused ? "Retomar" : "Pausar"}
                            onClick={() => {
                              update(sub.id, { status: paused ? "active" : "paused" })
                              setOpenMenu(null)
                            }}
                          />
                          <MenuBtn
                            icon={<Trash2 size={14} />}
                            label="Remover"
                            danger
                            onClick={() => {
                              setConfirmCancel(sub.id)
                              setOpenMenu(null)
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>

            <button
              onClick={() => navigate("catalog")}
              className="w-full flex items-center justify-center gap-2 py-3.5 border-t border-line text-sm font-semibold text-brand hover:bg-sunken transition-colors rounded-b-xl cursor-pointer"
            >
              <Plus size={15} strokeWidth={2.4} />
              Adicionar do catálogo
            </button>
          </div>
        )}
      </div>

      {toCancel && (
        <div className="modal-backdrop">
          <div className="card p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-ink text-xl mb-2">Remover {toCancel.name}?</h3>
            <p className="text-muted text-sm mb-6">
              Ela sai da sua lista e dos cálculos. Isso não cancela o serviço junto à empresa.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmCancel(null)} className="btn-secondary flex-1">
                Voltar
              </button>
              <button
                onClick={() => {
                  remove(toCancel.id)
                  setConfirmCancel(null)
                }}
                className="btn-danger flex-1"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {openMenu !== null && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
    </div>
  )
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="px-4 md:px-6 py-4">
      <p className="eyebrow">{label}</p>
      <p className={`num mt-1.5 text-base md:text-xl font-semibold ${strong ? "text-brand" : "text-ink"}`}>{value}</p>
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
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm hover:bg-sunken transition-colors cursor-pointer ${
        danger ? "text-danger" : "text-ink"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
