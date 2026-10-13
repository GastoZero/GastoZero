import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { login, setToken, type AuthUser } from "../lib/api"
import AuthLayout from "../components/AuthLayout"

interface Props {
  onLogin: (user: AuthUser) => void
  onRegister: () => void
}

export default function Login({ onLogin, onRegister }: Props) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(true)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { token, user } = await login(email.trim(), password)
      setToken(token, remember)
      onLogin(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : "E-mail ou senha inválidos.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
          <h2 className="text-3xl font-bold text-ink mb-2">Bem-vindo de volta</h2>
          <p className="text-muted text-sm mb-8">
            Tenha controle sobre seus gastos recorrentes.
          </p>

          <form className="space-y-4" onSubmit={submit} noValidate>
            <div>
              <label className="label">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@email.com"
                className="input py-3"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Senha</label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(o => !o)}
                  aria-expanded={forgotOpen}
                  className="text-xs text-brand hover:underline underline-offset-4 font-medium"
                >
                  Esqueci minha senha
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input py-3"
              />
              {forgotOpen && (
                <p className="mt-2 text-xs text-muted bg-sunken rounded-lg px-3 py-2.5">
                  A recuperação de senha por e-mail ainda não está disponível. Se você está logado em
                  outro aparelho, troque a senha em Configurações → Segurança.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 accent-[var(--color-brand)] rounded"
              />
              <label htmlFor="remember" className="text-sm text-ink-2">Lembrar de mim</label>
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
              {loading ? "Entrando..." : "Entrar"}
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Ainda não possui uma conta?{" "}
            <button
              onClick={onRegister}
              className="text-brand hover:underline underline-offset-4 font-semibold"
            >
              Criar conta
            </button>
          </p>
    </AuthLayout>
  )
}
