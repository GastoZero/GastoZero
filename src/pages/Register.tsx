import { useState } from "react"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { register, setToken, type AuthUser } from "../lib/api"
import AuthLayout from "../components/AuthLayout"

interface Props {
  onRegister: (user: AuthUser) => void
  onLogin: () => void
}

export default function Register({ onRegister, onLogin }: Props) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.name.trim().length < 2) {
      setError("Informe seu nome.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Informe um e-mail válido.")
      return
    }
    if (form.password.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.")
      return
    }
    if (form.password !== form.confirm) {
      setError("As senhas não coincidem.")
      return
    }
    setError("")
    setLoading(true)
    try {
      const { token, user } = await register(form.name.trim(), form.email.trim(), form.password)
      setToken(token)
      onRegister(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a conta.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
        <h2 className="text-3xl font-bold text-ink mb-2">Crie sua conta</h2>
        <p className="text-muted text-sm mb-8">
          Organize suas assinaturas, acompanhe seus gastos e descubra quanto você pode economizar.
        </p>

        <form className="space-y-4" onSubmit={submit} noValidate>
          <div>
            <label className="label">Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              placeholder="Digite seu nome"
              className="input py-3"
            />
          </div>

          <div>
            <label className="label">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="Digite seu e-mail"
              className="input py-3"
            />
          </div>

          <div>
            <label className="label">Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="Digite sua senha"
              className="input py-3"
            />
          </div>

          <div>
            <label className="label">Confirmar senha</label>
            <input
              type="password"
              value={form.confirm}
              onChange={set("confirm")}
              placeholder="Confirme sua senha"
              className="input py-3"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 group"
          >
            {loading ? "Criando conta..." : "Criar minha conta"}
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        <button
          onClick={onLogin}
          className="mt-6 flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} />
          Já possui uma conta? Entrar
        </button>
    </AuthLayout>
  )
}
