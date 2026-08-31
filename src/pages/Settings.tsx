import { useState } from "react"
import {
  User, Mail, Bell, Globe, Lock, LogOut, ChevronRight, Save
} from "lucide-react"
import type { UserProfile } from "../types"

interface Props {
  profile: UserProfile
  onSaveProfile: (profile: UserProfile) => void
  onLogout: () => void
}

export default function Settings({ profile, onSaveProfile, onLogout }: Props) {
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [alerts, setAlerts] = useState({ billing: true, renewal: true })
  const [saved, setSaved] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  const toggleAlert = (k: keyof typeof alerts) =>
    setAlerts(a => ({ ...a, [k]: !a[k] }))

  const save = () => {
    onSaveProfile({ name: name.trim() || profile.name, email: email.trim() || profile.email })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-full pb-20 md:pb-6">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-5 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-800">Configurações</h1>
      </header>

      <div className="px-4 md:px-8 py-6 max-w-2xl space-y-5">
        {/* Profile */}
        <Section title="Perfil" icon={<User size={16} />}>
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl">
              {(name.trim()[0] ?? "?").toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{name}</p>
              <p className="text-sm text-slate-500">{email}</p>
            </div>
          </div>
          <div className="space-y-3">
            <Field label="Nome" icon={<User size={14} />} value={name} onChange={setName} />
            <Field label="E-mail" icon={<Mail size={14} />} value={email} onChange={setEmail} type="email" />
          </div>
          <button
            onClick={save}
            className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              saved ? "bg-green-100 text-green-700" : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            <Save size={14} />
            {saved ? "Salvo!" : "Salvar alterações"}
          </button>
        </Section>

        {/* Notifications */}
        <Section title="Notificações" icon={<Bell size={16} />}>
          <div className="space-y-4">
            <SwitchRow
              label="Alertas de cobrança"
              description="Avise antes de débitos automáticos"
              checked={alerts.billing}
              onChange={() => toggleAlert("billing")}
            />
            <SwitchRow
              label="Alertas de renovação"
              description="Lembre-me quando uma assinatura renovar"
              checked={alerts.renewal}
              onChange={() => toggleAlert("renewal")}
            />
          </div>
        </Section>

        {/* Preferences */}
        <Section title="Preferências" icon={<Globe size={16} />}>
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-slate-700">Moeda</p>
              <p className="text-xs text-slate-500">Moeda exibida nos valores</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg">BRL — R$</span>
            </div>
          </div>
        </Section>

        {/* Account */}
        <Section title="Conta" icon={<Lock size={16} />}>
          <div className="space-y-1">
            <ActionRow
              icon={<Lock size={15} />}
              label="Alterar senha"
              onClick={() => {}}
            />
            <ActionRow
              icon={<LogOut size={15} />}
              label="Sair da conta"
              danger
              onClick={() => setConfirmLogout(true)}
            />
          </div>
        </Section>
      </div>

      {/* Logout confirm modal */}
      {confirmLogout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-slate-800 text-lg mb-2">Sair da conta</h3>
            <p className="text-slate-500 text-sm mb-6">
              Ao sair, os dados salvos neste navegador são apagados. Você precisará fazer login novamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={onLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <span className="text-slate-500">{icon}</span>
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Field({
  label, icon, value, onChange, type = "text",
}: {
  label: string
  icon: React.ReactNode
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        />
      </div>
    </div>
  )
}

function SwitchRow({
  label, description, checked, onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors duration-200 ${checked ? "bg-green-600" : "bg-slate-200"}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-1"}`} />
      </button>
    </div>
  )
}

function ActionRow({
  icon, label, danger, onClick,
}: {
  icon: React.ReactNode
  label: string
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition text-sm font-medium hover:bg-slate-50 ${
        danger ? "text-red-600" : "text-slate-700"
      }`}
    >
      <span className={danger ? "text-red-500" : "text-slate-400"}>{icon}</span>
      {label}
      <ChevronRight size={15} className="ml-auto text-slate-300" />
    </button>
  )
}
