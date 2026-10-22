import { useCallback, useState } from "react"
import { Search, X } from "lucide-react"
import type { AdminUser } from "../../types"
import * as api from "../../lib/api"
import { useLoad } from "../../lib/useLoad"
import { cycleLabel, formatCurrency, formatDate } from "../../lib/format"
import PageHeader from "../../components/PageHeader"
import DataState from "../../components/DataState"
import Avatar from "../../components/Avatar"
import ServiceMark from "../../components/ServiceMark"

export default function Users() {
  const { data, error } = useLoad(api.adminListUsers)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<AdminUser | null>(null)

  const term = search.trim().toLowerCase()
  const filtered = (data ?? []).filter(u => `${u.name} ${u.email}`.toLowerCase().includes(term))

  return (
    <div className="min-h-full pb-24 md:pb-10">
      <PageHeader
        eyebrow="Administração"
        title="Usuários"
        description="Contas cadastradas no GastoZero. Clique em um usuário para ver as assinaturas dele."
      />

      <div className="px-4 md:px-10 space-y-5">
        <div className="relative lg:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail"
            className="input pl-10"
          />
        </div>

        {!data ? (
          <DataState error={error} />
        ) : (
          <div className="card overflow-hidden">
            <div className="hidden md:grid grid-cols-[minmax(0,1fr)_120px_110px_130px] gap-4 px-5 py-3 border-b border-line eyebrow">
              <span>Usuário</span>
              <span>Cadastro</span>
              <span className="text-right">Assinaturas</span>
              <span className="text-right">Por mês</span>
            </div>

            {filtered.length === 0 && (
              <p className="text-center py-12 text-muted text-sm">Nenhum usuário encontrado.</p>
            )}

            <ul className="divide-y divide-line">
              {filtered.map(user => (
                <li key={user.id}>
                  <button
                    onClick={() => setSelected(user)}
                    className="w-full text-left grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_120px_110px_130px] gap-4 items-center px-4 md:px-5 py-3.5 hover:bg-sunken transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={user.name} />
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate">{user.name}</p>
                        <p className="text-xs text-muted truncate">{user.email}</p>
                      </div>
                    </div>
                    <span className="hidden md:block num text-sm text-ink-2">{formatDate(user.createdAt)}</span>
                    <span className="hidden md:block num text-sm text-ink-2 text-right">{user.subscriptions}</span>
                    <div className="text-right">
                      <p className="num font-semibold text-ink">{formatCurrency(user.monthlyTotal)}</p>
                      <p className="md:hidden text-xs text-muted">{user.subscriptions} assinaturas</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {selected && <UserModal user={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function UserModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const load = useCallback(() => api.adminUserSubscriptions(user.id), [user.id])
  const { data, error } = useLoad(load)

  return (
    <div className="modal-backdrop">
      <div className="card p-6 max-w-lg w-full shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-start gap-3 mb-5">
          <Avatar name={user.name} />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-ink text-xl truncate">{user.name}</h3>
            <p className="text-sm text-muted truncate">
              {user.email} · desde <span className="num">{formatDate(user.createdAt)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg hover:bg-sunken flex items-center justify-center text-muted hover:text-ink transition-colors cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        {!data ? (
          <DataState error={error} />
        ) : data.length === 0 ? (
          <p className="text-center py-10 text-muted text-sm">Este usuário ainda não tem assinaturas.</p>
        ) : (
          <ul className="divide-y divide-line overflow-y-auto -mx-1">
            {data.map(sub => (
              <li key={sub.id} className={`flex items-center gap-3 py-3 px-1 ${sub.status === "paused" ? "opacity-60" : ""}`}>
                <ServiceMark name={sub.name} color={sub.color} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{sub.name}</p>
                  <p className="text-xs text-muted truncate">
                    {sub.plan} · {sub.category}
                    {sub.status === "paused" && <span className="ml-1.5 text-warn font-semibold">· Pausada</span>}
                  </p>
                </div>
                <p className="num text-sm font-semibold text-ink">
                  {formatCurrency(sub.price)}
                  <span className="text-xs text-muted font-normal">{cycleLabel(sub.cycle)}</span>
                </p>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 pt-4 border-t border-line flex justify-between text-sm">
          <span className="text-muted">Total mensal (ativas)</span>
          <span className="num font-semibold text-ink">{formatCurrency(user.monthlyTotal)}</span>
        </p>
      </div>
    </div>
  )
}
