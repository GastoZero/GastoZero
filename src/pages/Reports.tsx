import { Download, Plus, Printer } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { Page, Subscription } from "../types"
import {
  addDays,
  billingLabel,
  CYCLES,
  cycleName,
  daysBetween,
  formatCurrency,
  formatShortDate,
  nextCycleDate,
  parseISODate,
  toISODate,
} from "../lib/format"
import { chartTheme } from "../lib/chart"
import PageHeader from "../components/PageHeader"
import ServiceMark from "../components/ServiceMark"

interface Props {
  subscriptions: Subscription[]
  navigate: (p: Page) => void
  isDark: boolean
}

/** Quantos meses à frente aparecem na previsão de cobranças. */
const PROJECTION_MONTHS = 6
/** Quantas assinaturas aparecem no ranking das mais caras. */
const TOP_SUBSCRIPTIONS = 8
/** Janela (em dias) da lista de próximas cobranças. */
const UPCOMING_DAYS = 30
/** Quantas cobranças aparecem na lista; o total considera todas. */
const UPCOMING_LIST_SIZE = 6

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

interface Group {
  name: string
  count: number
  /** Gasto mensal somado. */
  value: number
}

interface Charge {
  sub: Subscription
  date: Date
  days: number
}

/** Todas as datas de cobrança de uma assinatura entre a próxima cobrança e `until` (exclusivo). */
function occurrences(sub: Subscription, until: Date): Date[] {
  const dates: Date[] = []
  let date = parseISODate(sub.nextBilling)
  for (let guard = 0; date && date < until && guard < 400; guard++) {
    dates.push(date)
    date = nextCycleDate(date, sub.cycle)
  }
  return dates
}

const sumMonthly = (subs: Subscription[]) => subs.reduce((total, s) => total + s.monthlyPrice, 0)

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** Calcula todos os números da tela a partir das assinaturas do usuário. */
function buildReport(subscriptions: Subscription[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const active = subscriptions.filter(s => s.status === "active")
  const paused = subscriptions.filter(s => s.status === "paused")
  const monthlyTotal = sumMonthly(active)

  // Gasto mensal por categoria.
  const categoryMap = new Map<string, Group>()
  for (const sub of active) {
    const group = categoryMap.get(sub.category) ?? { name: sub.category, count: 0, value: 0 }
    group.count += 1
    group.value += sub.monthlyPrice
    categoryMap.set(sub.category, group)
  }
  const categories = [...categoryMap.values()].sort((a, b) => b.value - a.value)

  // Assinaturas mais caras (custo normalizado por mês).
  const ranking: Group[] = [...active]
    .sort((a, b) => b.monthlyPrice - a.monthlyPrice)
    .slice(0, TOP_SUBSCRIPTIONS)
    .map(s => ({ name: s.name, count: 1, value: s.monthlyPrice }))

  // Por periodicidade (semanal, mensal, anual).
  const cycles = CYCLES.map(c => {
    const subs = active.filter(s => s.cycle === c.value)
    return { name: c.label, count: subs.length, value: sumMonthly(subs) }
  }).filter(c => c.count > 0)

  // Quanto será realmente cobrado em cada um dos próximos meses.
  const windowStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const windowEnd = new Date(windowStart.getFullYear(), windowStart.getMonth() + PROJECTION_MONTHS, 1)
  const months = Array.from({ length: PROJECTION_MONTHS }, (_, i) => {
    const d = new Date(windowStart.getFullYear(), windowStart.getMonth() + i, 1)
    return { key: toISODate(d).slice(0, 7), label: MONTHS[d.getMonth()], total: 0, count: 0 }
  })
  for (const sub of active) {
    for (const date of occurrences(sub, windowEnd)) {
      const month = months.find(m => m.key === toISODate(date).slice(0, 7))
      if (month) {
        month.total += sub.price
        month.count += 1
      }
    }
  }

  // Cobranças dos próximos dias (uma assinatura semanal pode aparecer várias vezes).
  const horizon = addDays(today, UPCOMING_DAYS + 1)
  const upcoming: Charge[] = active
    .flatMap(sub => occurrences(sub, horizon).map(date => ({ sub, date, days: daysBetween(today, date) })))
    .sort((a, b) => a.days - b.days)

  return {
    active,
    paused,
    monthlyTotal,
    annualTotal: monthlyTotal * 12,
    average: active.length > 0 ? monthlyTotal / active.length : 0,
    pausedMonthly: sumMonthly(paused),
    categories,
    ranking,
    cycles,
    months,
    upcoming,
    upcomingTotal: upcoming.reduce((total, c) => total + c.sub.price, 0),
    /** Todas as assinaturas, da mais cara para a mais barata. */
    detail: [...subscriptions].sort((a, b) => b.monthlyPrice - a.monthlyPrice),
  }
}

type Report = ReturnType<typeof buildReport>

export default function Reports({ subscriptions, navigate, isDark }: Props) {
  const report = buildReport(subscriptions)
  const chart = chartTheme(isDark)
  const hasData = subscriptions.length > 0

  const topCategory = report.categories[0]
  const priciest = report.ranking[0]
  const heaviestMonth = report.months.reduce((max, m) => (m.total > max.total ? m : max), report.months[0])

  // Destaques em linguagem simples; só aparecem os que fazem sentido para os dados do usuário.
  const insights: { label: string; text: React.ReactNode }[] = []
  if (topCategory && report.monthlyTotal > 0) {
    insights.push({
      label: "Maior categoria",
      text: (
        <>
          <strong className="font-semibold">{topCategory.name}</strong> concentra{" "}
          <span className="num font-semibold text-brand">
            {Math.round((topCategory.value / report.monthlyTotal) * 100)}%
          </span>{" "}
          do seu gasto mensal.
        </>
      ),
    })
  }
  if (priciest) {
    insights.push({
      label: "Mais cara",
      text: (
        <>
          <strong className="font-semibold">{priciest.name}</strong> custa{" "}
          <span className="num font-semibold text-brand">{formatCurrency(priciest.value * 12)}</span> por ano.
        </>
      ),
    })
  }
  if (report.paused.length > 0) {
    insights.push({
      label: "Pausadas",
      text: (
        <>
          {plural(report.paused.length, "assinatura pausada", "assinaturas pausadas")}. Se voltarem, seu gasto sobe{" "}
          <span className="num font-semibold text-brand">{formatCurrency(report.pausedMonthly)}</span> por mês.
        </>
      ),
    })
  }
  if (heaviestMonth && heaviestMonth.total > 0) {
    insights.push({
      label: "Mês mais pesado",
      text: (
        <>
          <strong className="font-semibold">{heaviestMonth.label}</strong> concentra{" "}
          <span className="num font-semibold text-brand">{formatCurrency(heaviestMonth.total)}</span> em cobranças.
        </>
      ),
    })
  }

  return (
    <div className="min-h-full pb-24 md:pb-10">
      <PageHeader
        eyebrow="Análise"
        title="Relatórios"
        description="Um panorama dos seus gastos com assinaturas: quanto sai, para onde vai e o que vem pela frente."
        actions={
          hasData && (
            <>
              <button onClick={() => exportCsv(report)} className="btn-secondary print:hidden">
                <Download size={15} /> CSV
              </button>
              <button onClick={() => window.print()} className="btn-primary print:hidden">
                <Printer size={15} /> PDF
              </button>
            </>
          )
        }
      />

      <div className="px-4 md:px-10 space-y-4">
        {!hasData ? (
          <section className="card p-8 text-center">
            <p className="text-ink font-semibold">Ainda não há dados para o relatório.</p>
            <p className="text-sm text-muted mt-1">Adicione sua primeira assinatura para ver os gráficos.</p>
            <button onClick={() => navigate("catalog")} className="btn-primary mt-4">
              <Plus size={15} /> Adicionar assinatura
            </button>
          </section>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat
                label="Gasto mensal"
                value={formatCurrency(report.monthlyTotal)}
                hint={`${plural(report.active.length, "ativa", "ativas")} · ${plural(report.paused.length, "pausada", "pausadas")}`}
              />
              <Stat label="Projeção anual" value={formatCurrency(report.annualTotal)} hint="mantendo o que tem hoje" />
              <Stat
                label={`Próximos ${UPCOMING_DAYS} dias`}
                value={formatCurrency(report.upcomingTotal)}
                hint={plural(report.upcoming.length, "cobrança", "cobranças")}
              />
              <Stat label="Média por assinatura" value={formatCurrency(report.average)} hint="por mês" />
            </div>

            {insights.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 break-inside-avoid">
                {insights.map(item => (
                  <div key={item.label} className="card p-4 border-l-[3px] border-l-brand">
                    <p className="eyebrow mb-1.5">{item.label}</p>
                    <p className="text-ink text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            )}

            <section className="card p-5 break-inside-avoid">
              <h2 className="font-bold text-ink text-lg">Cobranças dos próximos meses</h2>
              <p className="text-xs text-muted mb-4">
                Quanto será cobrado em cada mês. Assinaturas anuais aparecem só no mês da cobrança.
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={report.months} barCategoryGap={8}>
                  <CartesianGrid stroke={chart.grid} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: chart.tick, fontFamily: "Geist Mono, monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    formatter={v => [formatCurrency(Number(v)), "Cobrado"]}
                    contentStyle={chart.tooltip}
                    itemStyle={{ color: chart.tooltip.color }}
                    labelStyle={{ color: chart.tick }}
                    cursor={{ fill: chart.cursor }}
                  />
                  <Bar dataKey="total" fill={chart.bar} radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </section>

            <div className="grid md:grid-cols-2 gap-4 break-inside-avoid">
              <BarsCard
                title="Onde mais se gasta"
                description="Gasto mensal somado por categoria."
                data={report.categories}
                chart={chart}
              />
              <BarsCard
                title="Suas assinaturas mais caras"
                description={`Top ${TOP_SUBSCRIPTIONS} por custo mensal.`}
                data={report.ranking}
                chart={chart}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 break-inside-avoid">
              <section className="card p-5">
                <h2 className="font-bold text-ink text-lg">Próximas cobranças</h2>
                <p className="text-xs text-muted mb-3">Nos próximos {UPCOMING_DAYS} dias.</p>
                {report.upcoming.length === 0 ? (
                  <p className="h-[120px] flex items-center justify-center text-sm text-muted">
                    Nenhuma cobrança neste período.
                  </p>
                ) : (
                  <>
                    <ul className="divide-y divide-line -mx-1">
                      {report.upcoming.slice(0, UPCOMING_LIST_SIZE).map(({ sub, date, days }) => (
                        <li key={`${sub.id}-${toISODate(date)}`} className="flex items-center gap-3 py-2.5 px-1">
                          <ServiceMark name={sub.name} color={sub.color} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-ink truncate">{sub.name}</p>
                            <p className="text-xs text-muted">
                              {billingLabel(days)} · <span className="num">{formatShortDate(toISODate(date))}</span>
                            </p>
                          </div>
                          <p className="num text-sm font-semibold text-ink">{formatCurrency(sub.price)}</p>
                        </li>
                      ))}
                    </ul>
                    {report.upcoming.length > UPCOMING_LIST_SIZE && (
                      <p className="text-xs text-muted mt-2">
                        + {plural(report.upcoming.length - UPCOMING_LIST_SIZE, "cobrança", "cobranças")} no período.
                      </p>
                    )}
                  </>
                )}
              </section>

              <section className="card p-5">
                <h2 className="font-bold text-ink text-lg">Por periodicidade</h2>
                <p className="text-xs text-muted mb-4">Como seu gasto mensal se divide entre os tipos de cobrança.</p>
                {report.cycles.length === 0 ? (
                  <p className="h-[120px] flex items-center justify-center text-sm text-muted">Sem dados ainda.</p>
                ) : (
                  <ul className="space-y-4">
                    {report.cycles.map(c => (
                      <li key={c.name}>
                        <div className="flex items-baseline justify-between gap-2 text-sm">
                          <span className="font-semibold text-ink">
                            {c.name} <span className="text-muted font-normal">· {plural(c.count, "assinatura", "assinaturas")}</span>
                          </span>
                          <span className="num font-semibold text-ink">{formatCurrency(c.value)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-sunken mt-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-brand"
                            style={{ width: `${report.monthlyTotal > 0 ? (c.value / report.monthlyTotal) * 100 : 0}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <section className="card break-inside-avoid">
              <h2 className="font-bold text-ink text-lg px-5 pt-5 pb-3">Detalhe por assinatura</h2>
              <div className={`${ROW_GRID} px-5 py-3 border-y border-line eyebrow`}>
                <span>Assinatura</span>
                <span className="hidden md:block">Periodicidade</span>
                <span className="hidden md:block">Próxima</span>
                <span className="text-right">Por mês</span>
              </div>
              <ul className="divide-y divide-line">
                {report.detail.map(s => (
                  <li key={s.id} className={`${ROW_GRID} px-5 py-3 text-sm items-center ${s.status === "paused" ? "opacity-60" : ""}`}>
                    <span className="flex items-center gap-3 min-w-0">
                      <ServiceMark name={s.name} color={s.color} size="sm" />
                      <span className="min-w-0">
                        <span className="block font-semibold text-ink truncate">{s.name}</span>
                        <span className="block text-xs text-muted truncate">
                          {s.category}
                          {s.status === "paused" && " · Pausada"}
                        </span>
                      </span>
                    </span>
                    <span className="hidden md:block text-ink-2">{cycleName(s.cycle)}</span>
                    <span className="hidden md:block num text-ink-2">{s.status === "paused" ? "—" : s.nextBillingLabel}</span>
                    <span className="num font-semibold text-ink text-right">{formatCurrency(s.monthlyPrice)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

/** Colunas da tabela de detalhe: no celular só nome e valor. */
const ROW_GRID = "grid grid-cols-[minmax(0,1fr)_110px] md:grid-cols-[minmax(0,1fr)_120px_90px_120px] gap-4"

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="num text-lg md:text-xl font-semibold text-ink mt-1">{value}</p>
      {hint && <p className="text-[11px] text-muted mt-0.5">{hint}</p>}
    </div>
  )
}

interface BarsCardProps {
  title: string
  description: string
  data: Group[]
  chart: ReturnType<typeof chartTheme>
}

/** Barras horizontais de uma série só: rótulo à esquerda, valor mensal no tooltip. */
function BarsCard({ title, description, data, chart }: BarsCardProps) {
  return (
    <section className="card p-5">
      <h2 className="font-bold text-ink text-lg">{title}</h2>
      <p className="text-xs text-muted mb-4">{description}</p>
      {data.length === 0 ? (
        <p className="h-[160px] flex items-center justify-center text-sm text-muted">Sem dados ainda.</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(160, data.length * 34)}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8 }} barCategoryGap={6}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fontSize: 12, fill: chart.tick }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={v => [formatCurrency(Number(v)), " por mês"]}
              separator=""
              contentStyle={chart.tooltip}
              itemStyle={{ color: chart.tooltip.color }}
              labelStyle={{ color: chart.tick }}
              cursor={{ fill: chart.cursor }}
            />
            <Bar dataKey="value" fill={chart.bar} radius={[0, 4, 4, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  )
}

/** Baixa um CSV (separado por ";" para abrir direto no Excel em pt-BR). */
function exportCsv(report: Report) {
  const money = (v: number) => v.toFixed(2).replace(".", ",")
  const groupRows = (title: string, groups: Group[]) => [
    [title, "Assinaturas", "Gasto mensal (R$)"],
    ...groups.map(g => [g.name, g.count, money(g.value)]),
  ]

  const rows: (string | number)[][] = [
    ["Indicador", "Valor"],
    ["Gasto mensal (R$)", money(report.monthlyTotal)],
    ["Projeção anual (R$)", money(report.annualTotal)],
    ["Assinaturas ativas", report.active.length],
    ["Assinaturas pausadas", report.paused.length],
    [`Cobranças nos próximos ${UPCOMING_DAYS} dias (R$)`, money(report.upcomingTotal)],
    ["Média por assinatura (R$)", money(report.average)],
    [],
    ...groupRows("Categoria", report.categories),
    [],
    ...groupRows("Periodicidade", report.cycles),
    [],
    ["Mês", "Cobranças", "Total cobrado (R$)"],
    ...report.months.map(m => [m.key, m.count, money(m.total)]),
    [],
    ["Assinatura", "Categoria", "Plano", "Periodicidade", "Status", "Próxima cobrança", "Valor do ciclo (R$)", "Por mês (R$)"],
    ...report.detail.map(s => [
      s.name,
      s.category,
      s.plan,
      cycleName(s.cycle),
      s.status === "active" ? "Ativa" : "Pausada",
      s.status === "active" ? s.nextBilling : "",
      money(s.price),
      money(s.monthlyPrice),
    ]),
  ]

  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n")
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = `gastozero-meu-relatorio-${toISODate(new Date())}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
