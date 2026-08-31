import { Bell, TrendingUp, CalendarDays, Wallet, Sparkles, ChevronRight, User } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import type { Page, Subscription, UserProfile } from "../types"
import { billingLabel, formatCurrency } from "../lib/format"

interface Props {
  subscriptions: Subscription[]
  profile: UserProfile
  navigate: (p: Page) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  Streaming: "#16A34A",
  "Música": "#22C55E",
  Cloud: "#4ADE80",
  Academia: "#86EFAC",
  Telefonia: "#BBF7D0",
  Software: "#6EE7B7",
  Games: "#34D399",
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

export default function Dashboard({ subscriptions, profile, navigate }: Props) {
  const active = subscriptions.filter(s => s.status === "active")
  const monthlyTotal = active.reduce((sum, s) => sum + s.monthlyPrice, 0)
  const annualTotal = monthlyTotal * 12

  const categoryMap: Record<string, number> = {}
  for (const sub of active) {
    categoryMap[sub.category] = (categoryMap[sub.category] || 0) + sub.monthlyPrice
  }
  const donutData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Projeção acumulada ao longo dos 12 meses seguintes, iniciando no mês atual.
  const currentMonth = new Date().getMonth()
  const barData = MONTHS.map((_, i) => ({
    month: MONTHS[(currentMonth + i) % 12],
    valor: Number((monthlyTotal * (i + 1)).toFixed(2)),
  }))

  const upcoming = [...active].sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 3)

  // Candidata natural a revisão: a assinatura ativa mais cara por mês.
  const priciest = active.reduce<Subscription | null>(
    (max, s) => (!max || s.monthlyPrice > max.monthlyPrice ? s : max),
    null,
  )
  const potentialMonthly = priciest?.monthlyPrice ?? 0
  const urgentCount = active.filter(s => s.daysUntil <= 3).length
  const firstName = profile.name.split(" ")[0] || "por aqui"

  return (
    <div className="min-h-full pb-20 md:pb-6">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Olá, {firstName} 👋</h1>
          <p className="text-sm text-slate-500 mt-0.5">Veja como estão seus gastos recorrentes este mês.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("alerts")}
            aria-label="Ver alertas"
            className="relative w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
          >
            <Bell size={18} />
            {urgentCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
          </button>
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
            <User size={16} />
          </div>
        </div>
      </header>

      <div className="px-4 md:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Gastos mensais"
            value={formatCurrency(monthlyTotal)}
            sub="este mês"
            color="text-red-600"
            bg="bg-red-50"
            icon={<Wallet size={18} className="text-red-500" />}
          />
          <StatCard
            label="Projeção anual"
            value={formatCurrency(annualTotal)}
            sub="mantendo suas assinaturas atuais"
            color="text-slate-800"
            bg="bg-slate-50"
            icon={<TrendingUp size={18} className="text-slate-400" />}
          />
          <StatCard
            label="Assinaturas ativas"
            value={String(active.length)}
            sub={`${subscriptions.length - active.length} pausada(s)`}
            color="text-slate-800"
            bg="bg-slate-50"
            icon={<CalendarDays size={18} className="text-slate-400" />}
          />
          <StatCard
            label="Economia possível"
            value={`${formatCurrency(potentialMonthly)}/mês`}
            sub={priciest ? `cancelando ${priciest.name}` : "sem assinaturas ativas"}
            color="text-green-700"
            bg="bg-green-50"
            icon={<Sparkles size={18} className="text-green-600" />}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Gastos por categoria</h3>
            {donutData.length === 0 ? (
              <EmptyChart message="Adicione assinaturas para ver a distribuição por categoria." />
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutData.map((entry, i) => (
                        <Cell key={entry.name} fill={colorFor(entry.name, i)} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [formatCurrency(Number(v)), "Por mês"]}
                      contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {donutData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: colorFor(entry.name, i) }}
                        />
                        <span className="text-slate-600">{entry.name}</span>
                      </div>
                      <span className="font-semibold text-slate-700">{formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-1">Projeção acumulada</h3>
            <p className="text-xs text-slate-500 mb-4">Quanto suas assinaturas somam ao longo dos próximos 12 meses.</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(v) => [formatCurrency(Number(v)), "Acumulado"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  cursor={{ fill: "#f0fdf4" }}
                />
                <Bar dataKey="valor" fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Próximas cobranças</h3>
              <button
                onClick={() => navigate("alerts")}
                className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
              >
                Ver todos <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {upcoming.length === 0 && (
                <p className="text-sm text-slate-400 py-4 text-center">Nenhuma cobrança programada.</p>
              )}
              {upcoming.map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{sub.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{sub.name}</p>
                      <p className="text-xs text-slate-500">{sub.plan} · {sub.nextBillingLabel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">{formatCurrency(sub.price)}</p>
                    <p
                      className={`text-xs font-medium ${
                        sub.daysUntil <= 1 ? "text-red-500" : sub.daysUntil <= 3 ? "text-amber-500" : "text-slate-400"
                      }`}
                    >
                      {billingLabel(sub.daysUntil)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-600 rounded-2xl p-5 flex flex-col">
            <div className="text-white/80 text-sm mb-1">💡 Dica de economia</div>
            <p className="text-white font-semibold text-base leading-snug mb-auto">
              Você pode economizar até{" "}
              <span className="text-yellow-300 font-bold">{formatCurrency(potentialMonthly * 12)}</span> por ano
              revisando suas assinaturas.
            </p>
            <button
              onClick={() => navigate("simulator")}
              className="mt-5 bg-white text-green-700 font-semibold text-sm py-2.5 px-4 rounded-xl hover:bg-green-50 transition flex items-center justify-center gap-1.5"
            >
              Simular economia <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const colorFor = (name: string, index: number) =>
  CATEGORY_COLORS[name] || `hsl(${140 + index * 15},60%,${55 - index * 5}%)`

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-[160px] flex items-center justify-center text-center text-sm text-slate-400 px-6">
      {message}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  sub: string
  color: string
  bg: string
  icon: React.ReactNode
}

function StatCard({ label, value, sub, color, bg, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
      <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-0.5 leading-tight">{sub}</p>
    </div>
  )
}
