import { useState } from "react"
import { Zap, TrendingDown, PieChart, Shield, ArrowRight } from "lucide-react"

interface Props {
  onLogin: (email: string) => void
  onRegister: () => void
}

// Credenciais de demonstração até a API de autenticação existir.
const DEMO_EMAIL = "admin@email.com"
const DEMO_PASSWORD = "admin123"

export default function Login({ onLogin, onRegister }: Props) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError("E-mail ou senha inválidos.")
      return
    }
    setError("")
    onLogin(DEMO_EMAIL)
  }

  return (
    <div className="min-h-full bg-slate-50 flex">
      {/* Left panel — illustration / brand */}
      <div className="hidden lg:flex flex-col w-[480px] bg-green-600 relative overflow-hidden p-12">
        {/* Abstract geometric shapes */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-green-500 rounded-full opacity-40" />
        <div className="absolute bottom-20 -left-20 w-56 h-56 bg-green-700 rounded-full opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-green-400 rounded-full opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-green-400 rounded-full opacity-20" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5 mb-auto">
          <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-2xl text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
            GastoZero
          </span>
        </div>

        {/* Main headline */}
        <div className="relative z-10 mt-auto">
          <h1 className="text-4xl font-bold text-white leading-snug mb-4">
            Controle total<br />sobre seus gastos<br />recorrentes.
          </h1>
          <p className="text-green-100 text-base leading-relaxed mb-10">
            Organize assinaturas, acompanhe despesas e descubra o que você pode economizar.
          </p>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: PieChart, text: "Visualização clara por categoria" },
              { icon: TrendingDown, text: "Simule economia em segundos" },
              { icon: Shield, text: "Alertas antes das cobranças" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/90 text-sm">
                <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center">
                  <Icon size={14} />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Zap size={15} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-xl text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>
              GastoZero
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Bem-vindo de volta</h2>
          <p className="text-slate-500 text-sm mb-8">
            Tenha controle sobre seus gastos recorrentes.
          </p>

          <form className="space-y-4" onSubmit={submit} noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@email.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-700">Senha</label>
                <button type="button" className="text-xs text-green-600 hover:text-green-700 font-medium">
                  Esqueci minha senha
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 accent-green-600 rounded"
              />
              <label htmlFor="remember" className="text-sm text-slate-600">Lembrar de mim</label>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 group"
            >
              Entrar
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Ainda não possui uma conta?{" "}
            <button
              onClick={onRegister}
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Criar conta
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
