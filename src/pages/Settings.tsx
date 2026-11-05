import { useState } from "react"
import { Lock, LogOut, ChevronRight } from "lucide-react"
import type { CurrencyCode, ExchangeRates, NotificationPrefs, ThemePreference, UserProfile } from "../types"
import { changePassword } from "../lib/api"
import { CURRENCIES, currencySymbol } from "../lib/format"
import PageHeader from "../components/PageHeader"
import Switch from "../components/Switch"
import ThemeSwitch from "../components/ThemeSwitch"

interface Props {
  profile: UserProfile
  onSaveProfile: (updates: Partial<UserProfile>) => Promise<void>
  rates: { rates: ExchangeRates; updatedAt: string | null }
  theme: ThemePreference
  onThemeChange: (t: ThemePreference) => void
  onLogout: () => void
}

export default function Settings({ profile, onSaveProfile, rates, theme, onThemeChange, onLogout }: Props) {
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [notifError, setNotifError] = useState("")
  const [currencyError, setCurrencyError] = useState("")
  const [savingCurrency, setSavingCurrency] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)

  const alerts = profile.notifications
  const dirty = name.trim() !== profile.name || email.trim().toLowerCase() !== profile.email

  const toggleAlert = async (k: keyof NotificationPrefs) => {
    setNotifError("")
    try {
      await onSaveProfile({ notifications: { ...alerts, [k]: !alerts[k] } })
    } catch (err) {
      setNotifError(err instanceof Error ? err.message : "Não foi possível salvar a preferência.")
    }
  }

  const changeCurrency = async (currency: CurrencyCode) => {
    setCurrencyError("")
    setSavingCurrency(true)
    try {
      await onSaveProfile({ currency })
    } catch (err) {
      setCurrencyError(err instanceof Error ? err.message : "Não foi possível salvar a moeda.")
    } finally {
      setSavingCurrency(false)
    }
  }

  const rateLabel = (() => {
    if (profile.currency === "BRL") return "Valores em reais, sem conversão."
    const perUnit = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      1 / rates.rates[profile.currency],
    )
    const when = rates.updatedAt
      ? `cotação de ${new Date(rates.updatedAt).toLocaleDateString("pt-BR")}`
      : "cotação de referência"
    return `1 ${profile.currency} = ${perUnit} · ${when}`
  })()

  const save = async () => {
    setProfileError("")
    setSaving(true)
    try {
      await onSaveProfile({ name: name.trim() || profile.name, email: email.trim() || profile.email })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Não foi possível salvar o perfil.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-full pb-24 md:pb-10">
      <PageHeader eyebrow="Conta" title="Configurações" />

      <div className="px-4 md:px-10 max-w-2xl space-y-4">
        <Section title="Perfil">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-hero text-hero-accent flex items-center justify-center font-display font-bold text-xl">
              {(name.trim()[0] ?? "?").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-ink truncate">{name || "Sem nome"}</p>
              <p className="text-sm text-muted truncate">{email}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="name" className="label">Nome</label>
              <input id="name" value={name} onChange={e => setName(e.target.value)} className="input" />
            </div>
            <div>
              <label htmlFor="email" className="label">E-mail</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" />
            </div>
          </div>
          {profileError && (
            <p role="alert" className="mt-3 text-sm text-danger bg-danger-soft rounded-lg px-3 py-2.5">
              {profileError}
            </p>
          )}
          <button onClick={save} disabled={saving || (!dirty && !saved)} className="btn-primary mt-4">
            {saving ? "Salvando..." : saved ? "Salvo" : "Salvar alterações"}
          </button>
        </Section>

        <Section title="Aparência">
          <Row label="Tema" description="O modo escuro usa um fundo azul-marinho.">
            <ThemeSwitch value={theme} onChange={onThemeChange} withLabels />
          </Row>
        </Section>

        {profile.role !== "admin" && (
        <Section title="Notificações">
          <div className="divide-y divide-line">
            <Row label="Alertas de cobrança" description="Aviso antes de débitos automáticos">
              <Switch checked={alerts.billing} onChange={() => toggleAlert("billing")} label="Alertas de cobrança" />
            </Row>
            <Row label="Alertas de renovação" description="Lembrete quando uma assinatura renovar">
              <Switch checked={alerts.renewal} onChange={() => toggleAlert("renewal")} label="Alertas de renovação" />
            </Row>
          </div>
          {notifError && (
            <p role="alert" className="mt-3 text-sm text-danger bg-danger-soft rounded-lg px-3 py-2.5">
              {notifError}
            </p>
          )}
        </Section>
        )}

        <Section title="Preferências">
          <Row label="Moeda" description={rateLabel}>
            <select
              aria-label="Moeda exibida nos valores"
              value={profile.currency}
              onChange={e => void changeCurrency(e.target.value as CurrencyCode)}
              disabled={savingCurrency}
              className="input num w-auto py-1.5 text-sm cursor-pointer"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.code} · {currencySymbol(c.code)} — {c.name}
                </option>
              ))}
            </select>
          </Row>
          {currencyError && (
            <p role="alert" className="mt-3 text-sm text-danger bg-danger-soft rounded-lg px-3 py-2.5">
              {currencyError}
            </p>
          )}
        </Section>

        <Section title="Segurança">
          <div className="-mx-2">
            <ActionRow icon={<Lock size={16} />} label="Alterar senha" onClick={() => setPasswordOpen(true)} />
            <ActionRow icon={<LogOut size={16} />} label="Sair da conta" danger onClick={() => setConfirmLogout(true)} />
          </div>
        </Section>
      </div>

      {confirmLogout && (
        <div className="modal-backdrop">
          <div className="card p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-ink text-xl mb-2">Sair da conta?</h3>
            <p className="text-muted text-sm mb-6">
              Suas assinaturas continuam salvas na sua conta. Você precisará entrar novamente.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmLogout(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button onClick={onLogout} className="btn-danger flex-1">
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {passwordOpen && <PasswordModal onClose={() => setPasswordOpen(false)} />}
    </div>
  )
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.next.length < 6) return setError("A nova senha deve ter ao menos 6 caracteres.")
    if (form.next !== form.confirm) return setError("As senhas não coincidem.")
    setError("")
    setLoading(true)
    try {
      await changePassword(form.current, form.next)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível alterar a senha.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <form onSubmit={submit} noValidate className="card p-6 max-w-sm w-full shadow-2xl space-y-3">
        <h3 className="font-bold text-ink text-xl mb-1">Alterar senha</h3>
        {done ? (
          <>
            <p role="status" aria-live="polite" className="text-sm font-medium text-brand">
              Senha alterada com sucesso.
            </p>
            <button type="button" onClick={onClose} className="btn-primary w-full">
              Fechar
            </button>
          </>
        ) : (
          <>
            <div>
              <label htmlFor="current-password" className="label">Senha atual</label>
              <input id="current-password" type="password" autoComplete="current-password" value={form.current} onChange={set("current")} className="input" />
            </div>
            <div>
              <label htmlFor="new-password" className="label">Nova senha</label>
              <input id="new-password" type="password" autoComplete="new-password" value={form.next} onChange={set("next")} className="input" />
            </div>
            <div>
              <label htmlFor="confirm-password" className="label">Confirmar nova senha</label>
              <input id="confirm-password" type="password" autoComplete="new-password" value={form.confirm} onChange={set("confirm")} className="input" />
            </div>
            {error && (
              <p role="alert" className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2.5">
                {error}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 md:p-6">
      <h2 className="eyebrow mb-4">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 flex-wrap">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      {children}
    </div>
  )
}

function ActionRow({
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
      className={`w-full flex items-center gap-3 px-2 py-3 rounded-lg transition-colors text-sm font-medium hover:bg-sunken cursor-pointer ${
        danger ? "text-danger" : "text-ink"
      }`}
    >
      <span className={danger ? "text-danger" : "text-muted"}>{icon}</span>
      {label}
      <ChevronRight size={15} className="ml-auto text-muted" />
    </button>
  )
}
