import { useState } from "react"
import { UserPlus } from "lucide-react"
import * as api from "../../lib/api"
import { useLoad } from "../../lib/useLoad"
import { formatDate } from "../../lib/format"
import PageHeader from "../../components/PageHeader"
import DataState from "../../components/DataState"
import Avatar from "../../components/Avatar"

const EMPTY = { name: "", email: "", password: "" }

export default function Admins() {
  const { data, error, reload } = useLoad(api.adminListAdmins)
  const [form, setForm] = useState(EMPTY)
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setSaving(true)
    try {
      await api.adminCreateAdmin({ ...form, name: form.name.trim(), email: form.email.trim() })
      setForm(EMPTY)
      reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível cadastrar o administrador.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-full pb-24 md:pb-10">
      <PageHeader
        eyebrow="Administração"
        title="Administradores"
        description="Contas com acesso a este painel. Elas entram pela mesma tela de login, usando o próprio e-mail."
      />

      <div className="px-4 md:px-10 grid lg:grid-cols-[minmax(0,1fr)_340px] gap-4 items-start">
        {!data ? (
          <DataState error={error} />
        ) : (
          <ul className="card divide-y divide-line">
            {data.map(admin => (
              <li key={admin.id} className="flex items-center gap-3 px-4 md:px-5 py-3.5">
                <Avatar name={admin.name} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink truncate">{admin.name}</p>
                  <p className="text-xs text-muted truncate">{admin.email}</p>
                </div>
                <span className="num text-xs text-muted">desde {formatDate(admin.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={submit} noValidate className="card p-5 md:p-6 space-y-3">
          <h2 className="eyebrow mb-1">Novo administrador</h2>
          <div>
            <label htmlFor="admin-name" className="label">Nome</label>
            <input id="admin-name" value={form.name} onChange={set("name")} className="input" />
          </div>
          <div>
            <label htmlFor="admin-email" className="label">E-mail</label>
            <input id="admin-email" type="email" value={form.email} onChange={set("email")} className="input" />
          </div>
          <div>
            <label htmlFor="admin-password" className="label">Senha inicial</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
              placeholder="Mínimo de 6 caracteres"
              className="input"
            />
          </div>
          {formError && (
            <p role="alert" className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2.5">
              {formError}
            </p>
          )}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            <UserPlus size={16} />
            {saving ? "Cadastrando..." : "Cadastrar administrador"}
          </button>
        </form>
      </div>
    </div>
  )
}
