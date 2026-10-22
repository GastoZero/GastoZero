import { Download, Printer } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { AdminStats, StatGroup } from "../../types"
import * as api from "../../lib/api"
import { useLoad } from "../../lib/useLoad"
import { chartTheme } from "../../lib/chart"
import { formatCurrency, toISODate } from "../../lib/format"
import PageHeader from "../../components/PageHeader"
import DataState from "../../components/DataState"

/** Quantos serviços aparecem no gráfico; a tabela e o CSV mostram todos. */
const TOP_SERVICES = 8

export default function Reports({ isDark }: { isDark: boolean }) {
  const { data, error } = useLoad(api.adminStats)
  const chart = chartTheme(isDark)

  return (
    <div className="min-h-full pb-24 md:pb-10">
      <PageHeader
        eyebrow="Administração"
        title="Relatórios"
        description="Panorama das assinaturas ativas de todos os usuários."
        actions={
          data && (
            <>
              <button onClick={() => exportCsv(data)} className="btn-secondary print:hidden">
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
        {!data ? (
          <DataState error={error} />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Usuários" value={String(data.users)} hint={`${data.payingUsers} com assinaturas`} />
              <Stat label="Assinaturas ativas" value={String(data.activeSubscriptions)} />
              <Stat label="Gasto mensal total" value={formatCurrency(data.monthlyTotal)} />
              <Stat label="Média por assinante" value={formatCurrency(data.avgPerUser)} hint="por mês" />
            </div>

            <div className="grid md:grid-cols-2 gap-4 break-inside-avoid">
              <ChartCard
                title="Onde mais se gasta"
                description="Gasto mensal somado por categoria."
                data={data.byCategory}
                dataKey="value"
                format={formatCurrency}
                chart={chart}
              />
              <ChartCard
                title="Serviços mais assinados"
                description={`Top ${TOP_SERVICES} por número de assinaturas ativas.`}
                data={data.services.slice(0, TOP_SERVICES)}
                dataKey="count"
                format={v => `${v} assinaturas`}
                chart={chart}
              />
            </div>

            <section className="card break-inside-avoid">
              <h2 className="font-bold text-ink text-lg px-5 pt-5 pb-3">Detalhe por serviço</h2>
              <div className="grid grid-cols-[minmax(0,1fr)_100px_130px] gap-4 px-5 py-3 border-y border-line eyebrow">
                <span>Serviço</span>
                <span className="text-right">Assinaturas</span>
                <span className="text-right">Por mês</span>
              </div>
              {data.services.length === 0 && (
                <p className="text-center py-12 text-muted text-sm">Nenhuma assinatura ativa ainda.</p>
              )}
              <ul className="divide-y divide-line">
                {data.services.map(s => (
                  <li key={s.name} className="grid grid-cols-[minmax(0,1fr)_100px_130px] gap-4 px-5 py-3 text-sm">
                    <span className="font-semibold text-ink truncate">{s.name}</span>
                    <span className="num text-ink-2 text-right">{s.count}</span>
                    <span className="num font-semibold text-ink text-right">{formatCurrency(s.value)}</span>
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

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="num text-lg md:text-xl font-semibold text-ink mt-1">{value}</p>
      {hint && <p className="text-[11px] text-muted mt-0.5">{hint}</p>}
    </div>
  )
}

interface ChartCardProps {
  title: string
  description: string
  data: StatGroup[]
  dataKey: "value" | "count"
  format: (v: number) => string
  chart: ReturnType<typeof chartTheme>
}

/** Barras horizontais de uma série só: rótulo à esquerda, valor no tooltip. */
function ChartCard({ title, description, data, dataKey, format, chart }: ChartCardProps) {
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
              formatter={v => [format(Number(v)), ""]}
              separator=""
              contentStyle={chart.tooltip}
              itemStyle={{ color: chart.tooltip.color }}
              labelStyle={{ color: chart.tick }}
              cursor={{ fill: chart.cursor }}
            />
            <Bar dataKey={dataKey} fill={chart.bar} radius={[0, 4, 4, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  )
}

/** Baixa um CSV (separado por ";" para abrir direto no Excel em pt-BR). */
function exportCsv(stats: AdminStats) {
  const money = (v: number) => v.toFixed(2).replace(".", ",")
  const groupRows = (title: string, groups: StatGroup[]) => [
    [title, "Assinaturas", "Gasto mensal (R$)"],
    ...groups.map(g => [g.name, g.count, money(g.value)]),
  ]

  const rows: (string | number)[][] = [
    ["Indicador", "Valor"],
    ["Usuários", stats.users],
    ["Usuários com assinaturas", stats.payingUsers],
    ["Assinaturas ativas", stats.activeSubscriptions],
    ["Gasto mensal total (R$)", money(stats.monthlyTotal)],
    ["Média por assinante (R$)", money(stats.avgPerUser)],
    [],
    ...groupRows("Categoria", stats.byCategory),
    [],
    ...groupRows("Serviço", stats.services),
  ]

  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n")
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = `gastozero-relatorio-${toISODate(new Date())}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
