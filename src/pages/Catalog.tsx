import { useMemo, useState } from "react"
import { Search, X, Check, ArrowLeft, ChevronRight } from "lucide-react"
import type { CatalogService, Page, StoredSubscription, Subscription } from "../types"
import { CATALOG, CATEGORIES } from "../data/catalog"
import { addMonths, cycleLabel, formatCurrency, monthlyCost, toISODate } from "../lib/format"
import PageHeader from "../components/PageHeader"
import ServiceMark from "../components/ServiceMark"

interface Props {
  subscriptions: Subscription[]
  addSubscription: (s: Omit<StoredSubscription, "id">) => void
  navigate: (p: Page) => void
}

const FILTERS = ["Todos", ...CATEGORIES]

export default function Catalog({ subscriptions, addSubscription, navigate }: Props) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [selectedService, setSelectedService] = useState<CatalogService | null>(null)
  const [selectedPlan, setSelectedPlan] = useState(0)
  const [billingDate, setBillingDate] = useState("")
  const [price, setPrice] = useState("")
  const [success, setSuccess] = useState(false)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return CATALOG.filter(s => {
      const matchSearch = !term || s.name.toLowerCase().includes(term) || s.category.toLowerCase().includes(term)
      const matchCat = activeCategory === "Todos" || s.category === activeCategory
      return matchSearch && matchCat
    })
  }, [search, activeCategory])

  const alreadyAdded = (name: string) => subscriptions.some(s => s.name === name)

  const cheapestMonthly = (service: CatalogService) =>
    Math.min(...service.plans.map(p => monthlyCost(p.price, p.cycle)))

  const openService = (service: CatalogService) => {
    setSelectedService(service)
    setSelectedPlan(0)
    setPrice(service.plans[0].price.toFixed(2))
    setBillingDate(toISODate(addMonths(new Date(), 1)))
    setSuccess(false)
  }

  const choosePlan = (index: number) => {
    if (!selectedService) return
    setSelectedPlan(index)
    setPrice(selectedService.plans[index].price.toFixed(2))
  }

  const handleAdd = () => {
    if (!selectedService) return
    const plan = selectedService.plans[selectedPlan]
    const parsed = Number(price.replace(",", "."))

    addSubscription({
      name: selectedService.name,
      plan: plan.label,
      category: selectedService.category,
      price: Number.isFinite(parsed) && parsed > 0 ? parsed : plan.price,
      cycle: plan.cycle,
      nextBilling: billingDate || toISODate(addMonths(new Date(), 1)),
      status: "active",
      color: selectedService.color,
    })

    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setSelectedService(null)
      navigate("subscriptions")
    }, 1200)
  }

  return (
    <div className="min-h-full pb-24 md:pb-10">
      <div className="px-4 md:px-10 pt-5 md:pt-8">
        <button
          onClick={() => navigate("subscriptions")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          Assinaturas
        </button>
      </div>

      <PageHeader
        eyebrow="Catálogo"
        title="Nova assinatura"
        description="Escolha o serviço e o plano. O preço de referência já vem preenchido, e você ajusta se o seu for diferente."
      >
        <div className="relative mt-6 max-w-xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Qual serviço você usa?"
            autoFocus
            className="input pl-11 py-3 text-[15px]"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto mt-3 pb-1 -mx-4 px-4 md:mx-0 md:px-0">
          {FILTERS.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? "chip-on" : "chip-off"}
            >
              {cat}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="px-4 md:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {filtered.map(service => {
            const added = alreadyAdded(service.name)
            return (
              <button
                key={service.id}
                onClick={() => openService(service)}
                className="group card p-4 flex items-center gap-3.5 text-left hover:border-line-strong hover:bg-sunken/40 transition-colors cursor-pointer"
              >
                <ServiceMark name={service.name} color={service.color} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink truncate">{service.name}</p>
                    {added && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand">
                        <Check size={12} strokeWidth={3} />
                        na sua lista
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {service.category} · a partir de{" "}
                    <span className="num text-ink-2">{formatCurrency(cheapestMonthly(service))}</span>/mês
                  </p>
                </div>
                <ChevronRight size={17} className="text-muted group-hover:text-ink group-hover:translate-x-0.5 transition" />
              </button>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted text-sm">Nenhum serviço encontrado para "{search}".</div>
        )}
      </div>

      {selectedService && (
        <div
          className="modal-backdrop items-end sm:items-center p-0 sm:p-4"
          onClick={e => e.target === e.currentTarget && !success && setSelectedService(null)}
        >
          <div className="bg-surface border border-line w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            {success ? (
              <div className="p-10 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-brand rounded-full flex items-center justify-center mb-5">
                  <Check size={28} strokeWidth={3} className="text-on-brand" />
                </div>
                <h3 className="font-bold text-ink text-xl mb-1.5">Adicionada</h3>
                <p className="text-muted text-sm">{selectedService.name} já está na sua lista de assinaturas.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-line">
                  <div className="flex items-center gap-3">
                    <ServiceMark name={selectedService.name} color={selectedService.color} size="lg" />
                    <div>
                      <h3 className="font-bold text-ink text-lg leading-tight">{selectedService.name}</h3>
                      <p className="text-xs text-muted">{selectedService.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedService(null)}
                    aria-label="Fechar"
                    className="w-8 h-8 rounded-lg hover:bg-sunken flex items-center justify-center text-muted hover:text-ink transition-colors cursor-pointer"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                  <fieldset>
                    <legend className="label">Plano</legend>
                    <div className="space-y-1.5">
                      {selectedService.plans.map((plan, i) => {
                        const on = selectedPlan === i
                        return (
                          <label
                            key={plan.label}
                            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                              on ? "border-brand bg-brand-soft" : "border-line hover:border-line-strong"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  on ? "border-brand" : "border-line-strong"
                                }`}
                              >
                                {on && <span className="w-2 h-2 bg-brand rounded-full" />}
                              </span>
                              <span className="text-sm text-ink font-medium">{plan.label}</span>
                            </div>
                            <span className="num text-sm text-ink-2 text-right">
                              {formatCurrency(plan.price)}
                              <span className="text-muted">{cycleLabel(plan.cycle)}</span>
                              {plan.cycle === "yearly" && (
                                <span className="block text-[11px] text-muted">
                                  ≈ {formatCurrency(monthlyCost(plan.price, plan.cycle))}/mês
                                </span>
                              )}
                            </span>
                            <input
                              type="radio"
                              name="plan"
                              className="sr-only"
                              checked={on}
                              onChange={() => choosePlan(i)}
                            />
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="price" className="label">
                        Valor (R$)
                      </label>
                      <input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        className="input num"
                      />
                    </div>
                    <div>
                      <label htmlFor="billing" className="label">
                        Próxima cobrança
                      </label>
                      <input
                        id="billing"
                        type="date"
                        value={billingDate}
                        onChange={e => setBillingDate(e.target.value)}
                        className="input num"
                      />
                    </div>
                  </div>

                  <button onClick={handleAdd} className="btn-primary w-full py-3">
                    Adicionar às assinaturas
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
