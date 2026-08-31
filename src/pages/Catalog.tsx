import { useMemo, useState } from "react"
import { Search, X, CheckCircle, Calendar, Plus } from "lucide-react"
import type { CatalogService, Page, StoredSubscription, Subscription } from "../types"
import { CATALOG, CATEGORIES, CATEGORY_ICONS } from "../data/catalog"
import { addMonths, cycleLabel, formatCurrency, monthlyCost, toISODate } from "../lib/format"

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
      icon: selectedService.icon,
    })

    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setSelectedService(null)
      navigate("subscriptions")
    }, 1400)
  }

  return (
    <div className="min-h-full pb-20 md:pb-6">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-5 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-800">Catálogo de Serviços</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Preços já cadastrados: escolha o serviço e o plano, sem digitar valores.
        </p>

        <div className="relative mt-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Qual serviço você utiliza?"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition"
          />
        </div>

        <div className="flex gap-2 flex-wrap mt-3">
          {FILTERS.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeCategory === cat
                  ? "bg-green-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat !== "Todos" && <span className="mr-1">{CATEGORY_ICONS[cat]}</span>}
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 md:px-8 py-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(service => {
            const added = alreadyAdded(service.name)
            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col hover:shadow-sm hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{service.icon}</span>
                  {added && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      Ativa
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-0.5">{service.name}</h3>
                <p className="text-xs text-slate-500 mb-1">{service.category}</p>
                <p className="text-xs text-slate-400 mb-4">
                  A partir de {formatCurrency(cheapestMonthly(service))}/mês
                </p>
                <button
                  onClick={() => openService(service)}
                  className={`mt-auto w-full py-2 rounded-xl text-xs font-semibold transition ${
                    added
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  Ver planos
                </button>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm">
            Nenhum serviço encontrado para "{search}".
          </div>
        )}
      </div>

      {selectedService && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {success ? (
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">Assinatura adicionada!</h3>
                <p className="text-slate-500 text-sm">
                  {selectedService.name} foi adicionado com sucesso às suas assinaturas.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedService.icon}</span>
                    <div>
                      <h3 className="font-bold text-slate-800">{selectedService.name}</h3>
                      <p className="text-xs text-slate-500">{selectedService.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedService(null)}
                    aria-label="Fechar"
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2.5">Selecione seu plano</p>
                    <div className="space-y-2">
                      {selectedService.plans.map((plan, i) => (
                        <label
                          key={plan.label}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition ${
                            selectedPlan === i
                              ? "border-green-500 bg-green-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                selectedPlan === i ? "border-green-600" : "border-slate-300"
                              }`}
                            >
                              {selectedPlan === i && <div className="w-2 h-2 bg-green-600 rounded-full" />}
                            </div>
                            <span className="text-sm text-slate-700 font-medium">{plan.label}</span>
                          </div>
                          <span className="text-sm text-slate-500 text-right">
                            {formatCurrency(plan.price)}
                            {cycleLabel(plan.cycle)}
                            {plan.cycle === "yearly" && (
                              <span className="block text-[11px] text-slate-400">
                                ≈ {formatCurrency(monthlyCost(plan.price, plan.cycle))}/mês
                              </span>
                            )}
                          </span>
                          <input
                            type="radio"
                            name="plan"
                            className="sr-only"
                            checked={selectedPlan === i}
                            onChange={() => choosePlan(i)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Valor cobrado (R$)
                    </label>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Preenchido automaticamente pelo catálogo. Ajuste se seu valor for diferente.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="billing" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Data da próxima cobrança
                    </label>
                    <div className="relative">
                      <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="billing"
                        type="date"
                        value={billingDate}
                        onChange={e => setBillingDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAdd}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Adicionar assinatura
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
