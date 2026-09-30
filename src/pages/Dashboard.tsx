import { Bell, ArrowRight, ArrowUpRight } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import type { Page, Subscription, UserProfile } from "../types"
import { billingLabel, formatCurrency } from "../lib/format"
import ServiceMark from "../components/ServiceMark"

interface Props {
  subscriptions: Subscription[]
  profile: UserProfile
  navigate: (p: Page) => void
  isDark: boolean
}

/**
 * Cor fixa por categoria (a cor acompanha a categoria, não a posição no ranking).
 * Paleta categórica validada para daltonismo nos dois temas.
 */
const CATEGORY_COLORS: Record<string, { light: string; dark: string }> = {
  Streaming: { light: "#2a78d6", dark: "#3987e5" },
  "Música": { light: "#eb6834", dark: "#d95926" },
  Cloud: { light: "#1baf7a", dark: "#199e70" },
  Academia: { light: "#eda100", dark: "#c98500" },
  Telefonia: { light: "#e87ba4", dark: "#d55181" },
  Software: { light: "#008300", dark: "#008300" },
  Games: { light: "#4a3aa7", dark: "#9085e9" },
}
const OTHER_COLOR = { light: "#e34948", dark: "#e66767" }

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

export default function Dashboard({ subscriptions, profile, navigate, isDark }: Props) {
  const active = subscriptions.filter(s => s.status === "active")
  const paused = subscriptions.length - active.length
  const monthlyTotal = active.reduce((sum, s) => sum + s.monthlyPrice, 0)
  const annualTotal = monthlyTotal * 12

  const categoryMap: Record<string, number> = {}
  for (const sub of active) {
    categoryMap[sub.category] = (categoryMap[sub.category] || 0) + sub.monthlyPrice
  }
  const donutData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const colorFor = (name: string) => (CATEGORY_COLORS[name] ?? OTHER_COLOR)[isDark ? "dark" : "light"]

  // Projeção acumulada ao longo dos 12 meses seguintes, iniciando no mês atual.
  const currentMonth = new Date().getMonth()
  const barData = MONTHS.map((_, i) => ({
    month: MONTHS[(currentMonth + i) % 12],
    valor: Number((monthlyTotal * (i + 1)).toFixed(2)),
  }))

  const upcoming = [...active].sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 4)

  // Candidata natural a revisão: a assinatura ativa mais cara por mês.
  const priciest = active.reduce<Subscription | null>(
    (max, s) => (!max || s.monthlyPrice > max.monthlyPrice ? s : max),
    null,
  )
  const urgentCount = active.filter(s => s.daysUntil <= 3).length
  const firstName = profile.name.split(" ")[0] || "por aqui"

  const chart = {
    grid: isDark ? "#1d3247" : "#e3e8e2",
    tick: isDark ? "#7c91a6" : "#687887",
    bar: isDark ? "#3ad883" : "#0b7f45",
    cursor: isDark ? "rgba(58,216,131,0.08)" : "rgba(11,127,69,0.06)",
    tooltip: {
      borderRadius: 8,
      border: `1px solid ${isDark ? "#2a4560" : "#dbe1da"}`,
      background: isDark ? "#0f1d2c" : "#ffffff",
      color: isDark ? "#e6eef6" : "#0e1a26",
      fontSize: 12,
      fontFamily: "Geist Mono, monospace",
    },
  }

  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })

  return (
    <div className="min-h-full pb-24 md:pb-10">
      <header className="px-4 md:px-10 pt-6 md:pt-10 pb-6 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">{today}</p>
          <h1 className="text-[1.75rem] md:text-[2.1rem] font-bold text-ink leading-[1.1]">Olá, {firstName}.</h1>
        </div>
        <button
          onClick={() => navigate("alerts")}
          aria-label="Ver alertas"
          className="relative w-10 h-10 rounded-lg border border-line bg-surface hover:bg-sunken flex items-center justify-center text-ink-2 transition-colors cursor-pointer"
        >
          <Bell size={18} />
          {urgentCount > 0 && (
            <span className="absolute -top-1 -right-1 num min-w-[18px] h-[18px] px-1 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {urgentCount}
            </span>
          )}
        </button>
      </header>

      <div className="px-4 md:px-10 space-y-4">
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Destaque: total do mês */}
          <section className="lg:col-span-3 relative overflow-hidden rounded-xl bg-hero text-on-hero p-6 md:p-8">
            <svg
              aria-hidden="true"
              viewBox="0 0 200 200"
              className="absolute -right-10 -bottom-14 w-64 h-64 opacity-[0.09] pointer-events-none"
            >
              <circle cx="100" cy="100" r="64" fill="none" stroke="#4fe08f" strokeWidth="18" />
              <path d="M52 148 L148 52" stroke="#4fe08f" strokeWidth="18" strokeLinecap="round" />
            </svg>

            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-hero-muted">
              Você gasta por mês
            </p>
            <p className="num text-[2.6rem] md:text-[3.4rem] font-semibold leading-none mt-3 text-on-hero">
              {formatCurrency(monthlyTotal)}
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md relative">
              <HeroStat label="Em 12 meses" value={formatCurrency(annualTotal)} />
              <HeroStat label="Ativas" value={String(active.length)} />
              <HeroStat label="Pausadas" value={String(paused)} />
            </div>
          </section>

          {/* Próximas cobranças */}
          <section className="lg:col-span-2 card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-ink text-lg">Próximas cobranças</h2>
              <button
                onClick={() => navigate("alerts")}
                className="text-xs font-semibold text-brand hover:underline underline-offset-4 flex items-center gap-1 cursor-pointer"
              >
                Ver todas <ArrowRight size={13} />
              </button>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted py-8 text-center my-auto">Nenhuma cobrança programada.</p>
            ) : (
              <ul className="divide-y divide-line -mx-1">
                {upcoming.map(sub => (
                  <li key={sub.id} className="flex items-center gap-3 py-2.5 px-1">
                    <ServiceMark name={sub.name} color={sub.color} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{sub.name}</p>
                      <p
                        className={`text-xs ${
                          sub.daysUntil <= 1 ? "text-danger font-semibold" : sub.daysUntil <= 3 ? "text-warn font-semibold" : "text-muted"
                        }`}
                      >
                        {billingLabel(sub.daysUntil)} · <span className="num">{sub.nextBillingLabel}</span>
                      </p>
                    </div>
                    <p className="num text-sm font-semibold text-ink">{formatCurrency(sub.price)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <section className="card p-5">
            <h2 className="font-bold text-ink text-lg">Por categoria</h2>
            <p className="text-xs text-muted mb-4">Custo mensal de cada tipo de serviço.</p>
            {donutData.length === 0 ? (
              <EmptyChart message="Adicione assinaturas para ver a distribuição por categoria." />
            ) : (
              <div className="flex items-center gap-5">
                <div className="w-[150px] h-[150px] flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={46}
                        outerRadius={72}
                        paddingAngle={2}
                        dataKey="value"
                        stroke={isDark ? "#0f1d2c" : "#ffffff"}
                        strokeWidth={2}
                      >
                        {donutData.map(entry => (
                          <Cell key={entry.name} fill={colorFor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={v => [formatCurrency(Number(v)), "Por mês"]}
                        contentStyle={chart.tooltip}
                        itemStyle={{ color: chart.tooltip.color }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="flex-1 space-y-2 min-w-0">
                  {donutData.map(entry => (
                    <li key={entry.name} className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: colorFor(entry.name) }} />
                        <span className="text-ink-2 truncate">{entry.name}</span>
                      </span>
                      <span className="num font-medium text-ink">{formatCurrency(entry.value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="card p-5">
            <h2 className="font-bold text-ink text-lg">Acumulado em 12 meses</h2>
            <p className="text-xs text-muted mb-4">Quanto suas assinaturas atuais somam mês a mês.</p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={barData} barCategoryGap={4}>
                <CartesianGrid stroke={chart.grid} vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: chart.tick, fontFamily: "Geist Mono, monospace" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  formatter={v => [formatCurrency(Number(v)), "Acumulado"]}
                  contentStyle={chart.tooltip}
                  itemStyle={{ color: chart.tooltip.color }}
                  labelStyle={{ color: chart.tick }}
                  cursor={{ fill: chart.cursor }}
                />
                <Bar dataKey="valor" fill={chart.bar} radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        </div>

        {priciest && (
          <section className="card p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 border-l-[3px] border-l-brand">
            <div className="flex-1">
              <p className="eyebrow mb-1.5">Onde dá pra cortar</p>
              <p className="text-ink text-[15px] leading-relaxed">
                <strong className="font-semibold">{priciest.name}</strong> é sua assinatura mais cara. Sem ela, você
                guardaria{" "}
                <span className="num font-semibold text-brand">{formatCurrency(priciest.monthlyPrice * 12)}</span> por
                ano.
              </p>
            </div>
            <button onClick={() => navigate("simulator")} className="btn-secondary self-start md:self-auto">
              Simular cortes <ArrowUpRight size={15} />
            </button>
          </section>
        )}
      </div>
    </div>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-hero-muted">{label}</p>
      <p className="num text-sm md:text-base font-semibold text-on-hero mt-0.5">{value}</p>
    </div>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-[150px] flex items-center justify-center text-center text-sm text-muted px-6">{message}</div>
  )
}
