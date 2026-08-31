import { useState } from "react"
import { Zap, ArrowRight, ArrowLeft } from "lucide-react"

interface Props {
  onRegister: (name: string, email: string) => void
  onLogin: () => void
}

export default function Register({ onRegister, onLogin }: Props) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [error, setError] = useState("")

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = (e: React.FormEvent) => {
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
    onRegister(form.name.trim(), form.email.trim())
  }

  return (
    <div className="min-h-full bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Zap size={15} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-xl text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>
            GastoZero
          </span>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-1">Crie sua conta</h2>
        <p className="text-slate-500 text-sm mb-8">
          Organize suas assinaturas, acompanhe seus gastos e descubra quanto você pode economizar.
        </p>

        <form className="space-y-4" onSubmit={submit} noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              placeholder="Giovanna Silva"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="giovanna@email.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar senha</label>
            <input
              type="password"
              value={form.confirm}
              onChange={set("confirm")}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 group mt-2"
          >
            Criar minha conta
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        <button
          onClick={onLogin}
          className="mt-6 flex items-center gap-1.5 text-sm text-slate-500 hover:text-green-600 transition-colors"
        >
          <ArrowLeft size={14} />
          Já possui uma conta? Entrar
        </button>
      </div>
    </div>
  )
}
