import { useEffect, useMemo, useState } from "react"
import { Search, X, Check, ChevronRight, Plus } from "lucide-react"
import type { BillingCycle, CatalogService, Page, StoredSubscription, Subscription } from "../types"
import { CATEGORIES } from "../data/catalog"
import { listCatalog } from "../lib/api"
import {
  CYCLES,
  addMonths,
  currencySymbol,
  cycleLabel,
  displayCurrency,
  formatCurrency,
  formatPriceInput,
  fromDisplay,
  monthlyCost,
  parsePriceInput,
  toDisplay,
  toISODate,
} from "../lib/format"
import PageHeader from "../components/PageHeader"
import PriceInput from "../components/PriceInput"
import ServiceMark from "../components/ServiceMark"

interface Props {
  subscriptions: Subscription[]
  addSubscription: (s: Omit<StoredSubscription, "id">) => Promise<void>
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
  const [saving, setSaving] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [customName, setCustomName] = useState("")
  const [customCategory, setCustomCategory] = useState("Outros")
  /** Nome da categoria digitado quando o usuário escolhe "Outros". */
  const [customCategoryName, setCustomCategoryName] = useState("")
  const [customPlan, setCustomPlan] = useState("Personalizado")
  const [customPrice, setCustomPrice] = useState("")
  const [customCycle, setCustomCycle] = useState<BillingCycle>("monthly")
  const [customBillingDate, setCustomBillingDate] = useState(
    () => toISODate(addMonths(new Date(), 1))
  )
  const [customSaving, setCustomSaving] = useState(false)
  const [customError, setCustomError] = useState("")

  
const [catalog, setCatalog] = useState<CatalogService[]>([])
const [catalogLoading, setCatalogLoading] = useState(true)
const [catalogError, setCatalogError] = useState("")

useEffect(() => {
  let mounted = true

  async function loadCatalog() {
    try {
      const services = await listCatalog()

      if (mounted) {
        setCatalog(services)
      }
    } catch {
      if (mounted) {
        setCatalogError("Não foi possível carregar o catálogo.")
      }
    } finally {
      if (mounted) {
        setCatalogLoading(false)
      }
    }
  }

  void loadCatalog()

  return () => {
    mounted = false
  }
}, [])


  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return catalog.filter(s => {
      const matchSearch = !term || s.name.toLowerCase().includes(term) || s.category.toLowerCase().includes(term)
      const matchCat = activeCategory === "Todos" || s.category === activeCategory
      return matchSearch && matchCat
    })
  }, [catalog, search, activeCategory])

  const alreadyAdded = (name: string) => subscriptions.some(s => s.name === name)

  const cheapestMonthly = (service: CatalogService) =>
    Math.min(...service.plans.map(p => monthlyCost(p.price, p.cycle)))

  const openService = (service: CatalogService) => {
    setSelectedService(service)
    setSelectedPlan(0)
    setPrice(formatPriceInput(toDisplay(service.plans[0].price)))
    setBillingDate(toISODate(addMonths(new Date(), 1)))
    setSuccess(false)
  }

  const choosePlan = (index: number) => {
    if (!selectedService) return
    setSelectedPlan(index)
    setPrice(formatPriceInput(toDisplay(selectedService.plans[index].price)))
  }

  const handleAdd = async () => {
    if (!selectedService || saving) return
    const plan = selectedService.plans[selectedPlan]
    const parsed = parsePriceInput(price)
    // Preço original do catálogo na moeda exibida
    const referencePrice = Number(
      toDisplay(plan.price).toFixed(2)
    )
    // Preço informado pelo usuário
    const enteredPrice = parsed ?? referencePrice
    // Identifica se o preço padrão foi mantido
    const followsCatalog =
      Math.abs(enteredPrice - referencePrice) < 0.005


    setSaving(true)
    try {
      await addSubscription({
        name: selectedService.name,
        plan: plan.label,
        category: selectedService.category, 
        price: followsCatalog
          ? plan.price
          : fromDisplay(enteredPrice),

        catalogServiceId: selectedService.id,
        priceMode: followsCatalog ? "catalog" : "custom",
        cycle: plan.cycle,
        nextBilling: billingDate || toISODate(addMonths(new Date(), 1)),
        status: "active",
        color: selectedService.color,
      })
    } catch {
      return // o App já exibe a mensagem de erro
    } finally {
      setSaving(false)
    }

    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setSelectedService(null)
      navigate("subscriptions")
    }, 1200)
  }

  
const handleCustomAdd = async () => {
  if (customSaving) return

  const name = customName.trim()
  const plan = customPlan.trim()
  const category = customCategory === "Outros" ? customCategoryName.trim() : customCategory

  if (!name || !plan || !category || !customBillingDate) {
    setCustomError("Preencha todos os campos obrigatórios.")
    return
  }

  const value = parsePriceInput(customPrice)

  if (value === null) {
    setCustomError("Digite um valor válido. Ex.: 29,90")
    return
  }

  setCustomError("")
  setCustomSaving(true)

  try {
    await addSubscription({
      name,
      plan,
      category,
      price: fromDisplay(value),
      cycle: customCycle,
      nextBilling: customBillingDate,
      status: "active",
      color: "#0B7F45",
      catalogServiceId: null,
      priceMode: "custom",
    })

    setCustomOpen(false)
    navigate("subscriptions")
  } catch {
    setCustomError("Não foi possível salvar a assinatura. Tente novamente.")
  } finally {
    setCustomSaving(false)
  }
}

  return (
    <div className="min-h-full pb-10">
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
        {catalogLoading && (
          <p className="text-sm text-muted mb-4">
            Carregando catálogo...
          </p>
        )}

        {catalogError && (
          <p role="alert" className="text-sm text-danger mb-4">
            {catalogError}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
          
          <button
            type="button"
            onClick={() => setCustomOpen(true)}
            className="group card p-4 flex items-center gap-3.5 text-left hover:border-line-strong hover:bg-sunken/40 transition-colors cursor-pointer"
          >
            <span className="w-12 h-12 rounded-xl bg-brand flex-shrink-0 inline-flex items-center justify-center text-on-brand">
              <Plus size={24} strokeWidth={2.5} />
            </span>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink truncate">
                Cadastrar serviço
              </p>

              <p className="text-xs text-muted mt-0.5">
                Não encontrou? Adicione manualmente
              </p>
            </div>

            <ChevronRight
              size={17}
              className="text-muted group-hover:text-ink group-hover:translate-x-0.5 transition"
            />
          </button>


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

        {!catalogLoading && !catalogError && filtered.length === 0 && (
          <div className="text-center py-16 text-muted text-sm">Nenhum serviço encontrado para "{search}".</div>
        )}

      </div>

      {customOpen && (
        <div
          className="modal-backdrop"
          onClick={e => {
            if (e.target === e.currentTarget) {
              setCustomOpen(false)
            }
          }}
        >
          <div className="bg-surface border border-line w-full max-w-md rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-ink text-lg">
                  Cadastrar serviço
                </h3>
                <p className="text-xs text-muted mt-1">
                  Adicione uma assinatura personalizada.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCustomOpen(false)}
                className="text-muted hover:text-ink cursor-pointer"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            
            <form
              onSubmit={e => {
                e.preventDefault()
                void handleCustomAdd()
              }}
              className="space-y-4"
            >
              {/* Nome do serviço */}
              <div>
                <label htmlFor="custom-name" className="label">
                  Nome do serviço
                </label>
                <input
                  id="custom-name"
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="Ex.: Academia Fit"
                  className="input"
                  maxLength={80}
                  required
                />
              </div>

              {/* Categoria */}
              <div>
                <label htmlFor="custom-category" className="label">
                  Categoria
                </label>
                <select
                  id="custom-category"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  className="input"
                  required
                >
                  <option value="Outros">Outros</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {customCategory === "Outros" && (
                <div>
                  <label htmlFor="custom-category-name" className="label">
                    Qual é a categoria?
                  </label>
                  <input
                    id="custom-category-name"
                    type="text"
                    value={customCategoryName}
                    onChange={e => setCustomCategoryName(e.target.value)}
                    placeholder="Ex.: Lazer, Educação, Transporte"
                    className="input"
                    maxLength={40}
                    required
                  />
                </div>
              )}

              {/* Plano */}
              <div>
                <label htmlFor="custom-plan" className="label">
                  Nome do plano
                </label>
                <input
                  id="custom-plan"
                  type="text"
                  value={customPlan}
                  onChange={e => setCustomPlan(e.target.value)}
                  placeholder="Ex.: Plano mensal"
                  className="input"
                  maxLength={80}
                  required
                />
              </div>

              {/* Preço e periodicidade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="custom-price" className="label">
                    Valor ({currencySymbol(displayCurrency())})
                  </label>
                  <PriceInput id="custom-price" value={customPrice} onChange={setCustomPrice} required />
                </div>

                <div>
                  <label htmlFor="custom-cycle" className="label">
                    Periodicidade
                  </label>
                  <select
                    id="custom-cycle"
                    value={customCycle}
                    onChange={e => setCustomCycle(e.target.value as BillingCycle)}
                    className="input"
                  >
                    {CYCLES.map(c => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Próxima cobrança */}
              <div>
                <label htmlFor="custom-billing" className="label">
                  Próxima cobrança
                </label>
                <input
                  id="custom-billing"
                  type="date"
                  value={customBillingDate}
                  onChange={e => setCustomBillingDate(e.target.value)}
                  className="input num"
                  required
                />
              </div>

              {customError && (
                <p role="alert" className="text-sm text-danger">
                  {customError}
                </p>
              )}

              <p className="text-xs text-muted">
                Este serviço será adicionado apenas às suas assinaturas.
                Ele não altera o catálogo global do GastoZero.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomOpen(false)}
                  disabled={customSaving}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={customSaving}
                  className="btn-primary flex-1"
                >
                  {customSaving ? "Salvando..." : "Adicionar assinatura"}
                </button>
              </div>
            </form>


          </div>
        </div>
      )}


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
                              
                              <div>
                                <span className="text-sm text-ink font-medium">
                                  {plan.label}
                                </span>

                                {plan.priceUpdatedAt && (
                                  <span className="block text-xs text-muted">
                                    Referência do preço: {plan.priceUpdatedAt}
                                  </span>
                                )}
                              </div>

                            </div>
                            <span className="num text-sm text-ink-2 text-right">
                              {formatCurrency(plan.price)}
                              <span className="text-muted">{cycleLabel(plan.cycle)}</span>
                              {plan.cycle !== "monthly" && (
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
                        Valor ({currencySymbol(displayCurrency())})
                      </label>
                      <PriceInput id="price" value={price} onChange={setPrice} />
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

                  <button onClick={handleAdd} disabled={saving} className="btn-primary w-full py-3">
                    {saving ? "Adicionando..." : "Adicionar às assinaturas"}
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
