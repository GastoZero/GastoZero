import { useCallback, useState } from "react"
import { Pencil, Search, Trash2, X } from "lucide-react"
import type { AdminUser, BillingCycle, StoredSubscription, SubscriptionStatus } from "../../types"
import * as api from "../../lib/api"
import { useLoad } from "../../lib/useLoad"
import {
  CYCLES,
  currencySymbol,
  cycleLabel,
  displayCurrency,
  formatCurrency,
  formatDate,
  formatPriceInput,
  fromDisplay,
  monthlyCost,
  parsePriceInput,
  toDisplay,
} from "../../lib/format"
import PageHeader from "../../components/PageHeader"
import DataState from "../../components/DataState"
import Avatar from "../../components/Avatar"
import ServiceMark from "../../components/ServiceMark"
import PriceInput from "../../components/PriceInput"

const errorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

export default function Users() {
  const { data, error, reload } = useLoad(api.adminListUsers)
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const term = search.trim().toLowerCase()
  const filtered = (data ?? []).filter(u => `${u.name} ${u.email}`.toLowerCase().includes(term))
  // Derivado da lista para refletir edições assim que ela recarrega.
  const selected = data?.find(u => u.id === selectedId) ?? null

  return (
    <div className="min-h-full pb-24 md:pb-10">
      <PageHeader
        eyebrow="Administração"
        title="Usuários"
        description="Contas cadastradas no GastoZero. Clique em um usuário para editar os dados, as assinaturas ou excluir a conta."
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
                    onClick={() => setSelectedId(user.id)}
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

      {selected && (
        <UserModal
          key={selected.id}
          user={selected}
          onClose={() => setSelectedId(null)}
          onChanged={reload}
          onDeleted={() => {
            setSelectedId(null)
            reload()
          }}
        />
      )}
    </div>
  )
}

type View =
  | { kind: "details" }
  | { kind: "edit-sub"; sub: StoredSubscription }
  | { kind: "delete-sub"; sub: StoredSubscription }
  | { kind: "delete-user" }

interface ModalProps {
  user: AdminUser
  onClose: () => void
  /** Algo mudou (dados ou assinaturas): recarrega a lista de usuários. */
  onChanged: () => void
  onDeleted: () => void
}

function UserModal({ user, onClose, onChanged, onDeleted }: ModalProps) {
  const load = useCallback(() => api.adminUserSubscriptions(user.id), [user.id])
  const { data: subs, error, reload } = useLoad(load)
  const [view, setView] = useState<View>({ kind: "details" })
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState("")

  const monthlyTotal = (subs ?? [])
    .filter(s => s.status === "active")
    .reduce((sum, s) => sum + monthlyCost(s.price, s.cycle), 0)

  const back = () => {
    setActionError("")
    setView({ kind: "details" })
  }

  /** Executa uma ação da API cuidando do estado de carregamento e do erro. */
  const run = async (action: () => Promise<unknown>, fallback: string, after: () => void) => {
    if (busy) return
    setBusy(true)
    setActionError("")
    try {
      await action()
      after()
    } catch (err) {
      setActionError(errorMessage(err, fallback))
    } finally {
      setBusy(false)
    }
  }

  const afterSubChange = () => {
    reload()
    onChanged()
    back()
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && !busy && onClose()}>
      <div className="card p-6 max-w-lg w-full shadow-2xl max-h-[90vh] flex flex-col">
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
            disabled={busy}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg hover:bg-sunken flex items-center justify-center text-muted hover:text-ink transition-colors cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        {view.kind === "edit-sub" && (
          <SubscriptionForm
            sub={view.sub}
            busy={busy}
            error={actionError}
            onCancel={back}
            onSave={updates =>
              run(
                () => api.adminUpdateUserSubscription(user.id, view.sub.id, updates),
                "Não foi possível salvar a assinatura.",
                afterSubChange,
              )
            }
          />
        )}

        {view.kind === "delete-sub" && (
          <Confirm
            title={`Excluir ${view.sub.name}?`}
            text="A assinatura sai da lista deste usuário e dos cálculos. Essa ação não pode ser desfeita."
            confirmLabel="Excluir assinatura"
            busy={busy}
            error={actionError}
            onCancel={back}
            onConfirm={() =>
              run(
                () => api.adminDeleteUserSubscription(user.id, view.sub.id),
                "Não foi possível excluir a assinatura.",
                afterSubChange,
              )
            }
          />
        )}

        {view.kind === "delete-user" && (
          <Confirm
            title={`Excluir a conta de ${user.name}?`}
            text={`A conta e ${subs?.length ?? user.subscriptions} assinatura(s) serão apagadas permanentemente. Essa ação não pode ser desfeita.`}
            confirmLabel="Excluir usuário"
            busy={busy}
            error={actionError}
            onCancel={back}
            onConfirm={() => run(() => api.adminDeleteUser(user.id), "Não foi possível excluir o usuário.", onDeleted)}
          />
        )}

        {view.kind === "details" && (
          <div className="overflow-y-auto -mx-1 px-1 space-y-6">
            <AccountForm user={user} onSaved={onChanged} />

            <section>
              <h4 className="eyebrow mb-2">Assinaturas</h4>
              {!subs ? (
                <DataState error={error} />
              ) : subs.length === 0 ? (
                <p className="text-center py-8 text-muted text-sm">Este usuário ainda não tem assinaturas.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {subs.map(sub => (
                    <li key={sub.id} className="flex items-center gap-3 py-3">
                      <div className={`flex items-center gap-3 flex-1 min-w-0 ${sub.status === "paused" ? "opacity-60" : ""}`}>
                        <ServiceMark name={sub.name} color={sub.color} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">{sub.name}</p>
                          <p className="text-xs text-muted truncate">
                            {sub.plan} · {sub.category}
                            {sub.status === "paused" && <span className="ml-1.5 text-warn font-semibold">· Pausada</span>}
                          </p>
                        </div>
                        <p className="num text-sm font-semibold text-ink whitespace-nowrap">
                          {formatCurrency(sub.price)}
                          <span className="text-xs text-muted font-normal">{cycleLabel(sub.cycle)}</span>
                        </p>
                      </div>
                      <div className="flex gap-0.5">
                        <IconButton label={`Editar ${sub.name}`} onClick={() => setView({ kind: "edit-sub", sub })}>
                          <Pencil size={15} />
                        </IconButton>
                        <IconButton
                          label={`Excluir ${sub.name}`}
                          danger
                          onClick={() => setView({ kind: "delete-sub", sub })}
                        >
                          <Trash2 size={15} />
                        </IconButton>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-2 pt-4 border-t border-line flex justify-between text-sm">
                <span className="text-muted">Total mensal (ativas)</span>
                <span className="num font-semibold text-ink">{formatCurrency(subs ? monthlyTotal : user.monthlyTotal)}</span>
              </p>
            </section>

            <section className="pt-4 border-t border-line flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">Excluir usuário</p>
                <p className="text-xs text-muted">Apaga a conta e todas as assinaturas dela.</p>
              </div>
              <button onClick={() => setView({ kind: "delete-user" })} className="btn-danger">
                <Trash2 size={15} />
                Excluir
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

function AccountForm({ user, onSaved }: { user: AdminUser; onSaved: () => void }) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  const changed = name.trim() !== user.name || email.trim().toLowerCase() !== user.email

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!changed || saving) return
    if (!name.trim()) return setError("Informe o nome.")
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      await api.adminUpdateUser(user.id, { name: name.trim(), email: email.trim() })
      setSaved(true)
      onSaved()
    } catch (err) {
      setError(errorMessage(err, "Não foi possível salvar os dados."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h4 className="eyebrow">Dados da conta</h4>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="admin-user-name" className="label">
            Nome
          </label>
          <input
            id="admin-user-name"
            type="text"
            value={name}
            onChange={e => {
              setName(e.target.value)
              setSaved(false)
            }}
            className="input"
            maxLength={80}
            required
          />
        </div>
        <div>
          <label htmlFor="admin-user-email" className="label">
            E-mail
          </label>
          <input
            id="admin-user-email"
            type="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value)
              setSaved(false)
            }}
            className="input"
            required
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && !changed && <span className="text-xs font-semibold text-brand">Dados atualizados</span>}
        <button type="submit" disabled={!changed || saving} className="btn-primary">
          {saving ? "Salvando..." : "Salvar dados"}
        </button>
      </div>
    </form>
  )
}

interface SubscriptionFormProps {
  sub: StoredSubscription
  busy: boolean
  error: string
  onCancel: () => void
  onSave: (updates: Partial<api.SubscriptionInput>) => void
}

function SubscriptionForm({ sub, busy, error, onCancel, onSave }: SubscriptionFormProps) {
  const [name, setName] = useState(sub.name)
  const [plan, setPlan] = useState(sub.plan)
  const [category, setCategory] = useState(sub.category)
  const [price, setPrice] = useState(formatPriceInput(toDisplay(sub.price)))
  const [cycle, setCycle] = useState<BillingCycle>(sub.cycle)
  const [nextBilling, setNextBilling] = useState(sub.nextBilling)
  const [status, setStatus] = useState<SubscriptionStatus>(sub.status)
  const [formError, setFormError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !plan.trim() || !category.trim() || !nextBilling) {
      return setFormError("Preencha todos os campos.")
    }
    const value = parsePriceInput(price)
    if (value === null) return setFormError("Digite um valor válido. Ex.: 29,90")
    setFormError("")

    // Só envia o que mudou, para não desfazer o vínculo com o catálogo sem necessidade.
    const updates: Partial<api.SubscriptionInput> = {}
    if (name.trim() !== sub.name) updates.name = name.trim()
    if (plan.trim() !== sub.plan) updates.plan = plan.trim()
    if (category.trim() !== sub.category) updates.category = category.trim()
    if (price !== formatPriceInput(toDisplay(sub.price))) updates.price = fromDisplay(value)
    if (cycle !== sub.cycle) updates.cycle = cycle
    if (nextBilling !== sub.nextBilling) updates.nextBilling = nextBilling
    if (status !== sub.status) updates.status = status

    if (Object.keys(updates).length === 0) return onCancel()
    onSave(updates)
  }

  return (
    <form onSubmit={handleSubmit} className="overflow-y-auto -mx-1 px-1 space-y-4">
      <div className="flex items-center gap-3">
        <ServiceMark name={sub.name} color={sub.color} size="sm" />
        <h4 className="font-bold text-ink">Editar assinatura</h4>
      </div>

      <div>
        <label htmlFor="admin-sub-name" className="label">
          Nome do serviço
        </label>
        <input
          id="admin-sub-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="input"
          maxLength={80}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="admin-sub-plan" className="label">
            Plano
          </label>
          <input
            id="admin-sub-plan"
            type="text"
            value={plan}
            onChange={e => setPlan(e.target.value)}
            className="input"
            maxLength={80}
            required
          />
        </div>
        <div>
          <label htmlFor="admin-sub-category" className="label">
            Categoria
          </label>
          <input
            id="admin-sub-category"
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="input"
            maxLength={40}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="admin-sub-price" className="label">
            Valor ({currencySymbol(displayCurrency())})
          </label>
          <PriceInput id="admin-sub-price" value={price} onChange={setPrice} required />
        </div>
        <div>
          <label htmlFor="admin-sub-cycle" className="label">
            Periodicidade
          </label>
          <select
            id="admin-sub-cycle"
            value={cycle}
            onChange={e => setCycle(e.target.value as BillingCycle)}
            className="input"
          >
            {CYCLES.map(c => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="admin-sub-billing" className="label">
            Próxima cobrança
          </label>
          <input
            id="admin-sub-billing"
            type="date"
            value={nextBilling}
            onChange={e => setNextBilling(e.target.value)}
            className="input num"
            required
          />
        </div>
        <div>
          <label htmlFor="admin-sub-status" className="label">
            Status
          </label>
          <select
            id="admin-sub-status"
            value={status}
            onChange={e => setStatus(e.target.value as SubscriptionStatus)}
            className="input"
          >
            <option value="active">Ativa</option>
            <option value="paused">Pausada</option>
          </select>
        </div>
      </div>

      {(formError || error) && (
        <p role="alert" className="text-sm text-danger">
          {formError || error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} disabled={busy} className="btn-secondary flex-1">
          Voltar
        </button>
        <button type="submit" disabled={busy} className="btn-primary flex-1">
          {busy ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  )
}

interface ConfirmProps {
  title: string
  text: string
  confirmLabel: string
  busy: boolean
  error: string
  onCancel: () => void
  onConfirm: () => void
}

function Confirm({ title, text, confirmLabel, busy, error, onCancel, onConfirm }: ConfirmProps) {
  return (
    <div>
      <h4 className="font-bold text-ink text-lg mb-2">{title}</h4>
      <p className="text-muted text-sm mb-5">{text}</p>
      {error && (
        <p role="alert" className="text-sm text-danger mb-4">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={busy} className="btn-secondary flex-1">
          Voltar
        </button>
        <button onClick={onConfirm} disabled={busy} className="btn-danger flex-1">
          {busy ? "Excluindo..." : confirmLabel}
        </button>
      </div>
    </div>
  )
}

function IconButton({
  label,
  danger,
  onClick,
  children,
}: {
  label: string
  danger?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-muted transition-colors cursor-pointer hover:bg-sunken ${
        danger ? "hover:text-danger" : "hover:text-ink"
      }`}
    >
      {children}
    </button>
  )
}
