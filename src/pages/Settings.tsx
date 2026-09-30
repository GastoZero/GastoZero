import { useState } from "react"
import { Lock, LogOut, ChevronRight } from "lucide-react"
import type { ThemePreference, UserProfile } from "../types"
import PageHeader from "../components/PageHeader"
import Switch from "../components/Switch"
import ThemeSwitch from "../components/ThemeSwitch"

interface Props {
  profile: UserProfile
  onSaveProfile: (profile: UserProfile) => void
  theme: ThemePreference
  onThemeChange: (t: ThemePreference) => void
  onLogout: () => void
}

export default function Settings({ profile, onSaveProfile, theme, onThemeChange, onLogout }: Props) {
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [alerts, setAlerts] = useState({ billing: true, renewal: true })
  const [saved, setSaved] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  const toggleAlert = (k: keyof typeof alerts) => setAlerts(a => ({ ...a, [k]: !a[k] }))
  const dirty = name !== profile.name || email !== profile.email

  const save = () => {
    onSaveProfile({ name: name.trim() || profile.name, email: email.trim() || profile.email })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
          <button onClick={save} disabled={!dirty && !saved} className="btn-primary mt-4">
            {saved ? "Salvo" : "Salvar alterações"}
          </button>
        </Section>

        <Section title="Aparência">
          <Row label="Tema" description="O modo escuro usa um fundo azul-marinho.">
            <ThemeSwitch value={theme} onChange={onThemeChange} withLabels />
          </Row>
        </Section>

        <Section title="Notificações">
          <div className="divide-y divide-line">
            <Row label="Alertas de cobrança" description="Aviso antes de débitos automáticos">
              <Switch checked={alerts.billing} onChange={() => toggleAlert("billing")} label="Alertas de cobrança" />
            </Row>
            <Row label="Alertas de renovação" description="Lembrete quando uma assinatura renovar">
              <Switch checked={alerts.renewal} onChange={() => toggleAlert("renewal")} label="Alertas de renovação" />
            </Row>
          </div>
        </Section>

        <Section title="Preferências">
          <Row label="Moeda" description="Moeda exibida nos valores">
            <span className="num px-2.5 py-1 bg-sunken rounded-md text-sm text-ink-2">BRL · R$</span>
          </Row>
        </Section>

        <Section title="Segurança">
          <div className="-mx-2">
            <ActionRow icon={<Lock size={16} />} label="Alterar senha" onClick={() => {}} />
            <ActionRow icon={<LogOut size={16} />} label="Sair da conta" danger onClick={() => setConfirmLogout(true)} />
          </div>
        </Section>
      </div>

      {confirmLogout && (
        <div className="modal-backdrop">
          <div className="card p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-ink text-xl mb-2">Sair da conta?</h3>
            <p className="text-muted text-sm mb-6">
              Os dados salvos neste navegador serão apagados e você precisará entrar novamente.
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
