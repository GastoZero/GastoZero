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
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { token, user } = await login(email.trim(), password)
      setToken(token)
      onLogin(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : "E-mail ou senha inválidos.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
          <h2 className="text-3xl font-bold text-ink mb-2">Seu controle começa aqui</h2>
          <p className="text-muted text-sm mb-8">
            Acompanhe suas assinaturas e organize seus gastos.
          </p>

          <form className="space-y-4" onSubmit={submit} noValidate>
            
            <div>
              <label htmlFor="login-email" className="label">
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                autoComplete="email"
                className="input py-3"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="label">
                Senha
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
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
