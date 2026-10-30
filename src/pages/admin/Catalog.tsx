
import { useState } from "react"
import { Search, Pencil, X } from "lucide-react"
import * as api from "../../lib/api"
import { useLoad } from "../../lib/useLoad"
import PageHeader from "../../components/PageHeader"
import DataState from "../../components/DataState"
import ServiceMark from "../../components/ServiceMark"
import type { CatalogPlan } from "../../types"

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
})

export default function AdminCatalog() {
  const { data, error, reload } = useLoad(api.listCatalog)
  const [search, setSearch] = useState("")
    
  const [editing, setEditing] = useState<{
    serviceId: number
    serviceName: string
    plan: CatalogPlan
    } | null>(null)

    const [newPrice, setNewPrice] = useState("")
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
  


  const filtered = (data ?? []).filter(service =>
    service.name.toLowerCase().includes(
      search.trim().toLowerCase()
    )
  )


    const handleSavePrice = async (
    e: React.FormEvent<HTMLFormElement>
    ) => {
    e.preventDefault()

    if (!editing || saving) return

    const raw = newPrice.trim()

    if (!/^\d+(?:[.,]\d{1,2})?$/.test(raw)) {
        setSaveError("Digite um preço válido. Ex.: 49,90")
        return
    }

    const price = Number(raw.replace(",", "."))

    if (!Number.isFinite(price) || price < 0 || price > 999999) {
        setSaveError("Informe um preço válido.")
        return
    }

    setSaving(true)
    setSaveError("")

    try {
        await api.adminUpdateCatalogPrice(
        editing.serviceId,
        {
            label: editing.plan.label,
            cycle: editing.plan.cycle,
            price
        }
        )

        reload()
        setEditing(null)
        setSuccessMessage("Preço atualizado com sucesso!")
    } catch (err) {
        setSaveError(
        err instanceof Error
            ? err.message
            : "Não foi possível atualizar o preço."
        )
    } finally {
        setSaving(false)
    }
    }

  return (
    <div className="min-h-full pb-24 md:pb-10">
      <PageHeader
        eyebrow="Administração"
        title="Assinaturas"
        description="Gerencie os preços de referência dos serviços disponíveis no catálogo do GastoZero."
      />

      <div className="px-4 md:px-10 space-y-5">
        <div className="relative max-w-sm">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Buscar serviço"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        
        {successMessage && (
        <p
            role="status"
            className="text-sm font-medium text-brand"
        >
            {successMessage}
        </p>
        )}


        {!data ? (
          <DataState error={error} />
        ) : (
          <div className="card divide-y divide-line">
            {filtered.map(service => (
              <div
                key={service.id}
                className="p-4 md:p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <ServiceMark
                    name={service.name}
                    color={service.color}
                    size="md"
                  />

                  <div>
                    <h3 className="font-semibold text-ink">
                      {service.name}
                    </h3>
                    <p className="text-xs text-muted">
                      {service.category}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {service.plans.map((plan, index) => (
                    <div
                      key={`${plan.label}-${plan.cycle}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-line p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {plan.label}
                        </p>

                        <p className="text-xs text-muted">
                          Referência: {plan.priceUpdatedAt ?? "Não informada"}
                        </p>
                      </div>

                      
                        <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="num font-semibold text-ink">
                            {brl.format(plan.price)}
                            </p>

                            <p className="text-xs text-muted">
                            {plan.cycle === "monthly" ? "Mensal" : "Anual"}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                            setEditing({
                                serviceId: service.id,
                                serviceName: service.name,
                                plan
                            })

                            setNewPrice(
                                plan.price.toFixed(2).replace(".", ",")
                            )

                            setSaveError("")
                            setSuccessMessage("")
                            }}
                            className="btn-secondary px-3 py-2"
                            aria-label={`Editar preço de ${service.name} - ${plan.label}`}
                        >
                            <Pencil size={15} />
                            <span className="hidden sm:inline">
                            Editar
                            </span>
                        </button>
                        </div>


                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-center p-8 text-muted text-sm">
                Nenhum serviço encontrado.
              </p>
            )}
          </div>
        )}
      </div>

       
        {editing && (
        <div className="modal-backdrop">
            <form
            onSubmit={handleSavePrice}
            className="card w-full max-w-md p-6 shadow-2xl"
            >
            <div className="flex items-start justify-between mb-5">
                <div>
                <h2 className="text-xl font-bold text-ink">
                    Editar preço
                </h2>

                <p className="text-sm text-muted mt-1">
                    {editing.serviceName} · {editing.plan.label}
                </p>
                </div>

                <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={saving}
                className="text-muted hover:text-ink cursor-pointer"
                aria-label="Fechar"
                >
                <X size={20} />
                </button>
            </div>

            <div className="space-y-4">
                <div>
                <label className="label">
                    Preço atual
                </label>

                <p className="num text-lg font-semibold text-ink">
                    {brl.format(editing.plan.price)}
                </p>
                </div>

                <div>
                <label
                    htmlFor="admin-new-price"
                    className="label"
                >
                    Novo preço (R$)
                </label>

                <input
                    id="admin-new-price"
                    type="text"
                    inputMode="decimal"
                    className="input num"
                    value={newPrice}
                    onChange={e => {
                    setNewPrice(e.target.value)
                    setSaveError("")
                    }}
                    placeholder="Ex.: 49,90"
                    required
                    autoFocus
                />
                </div>

                <p className="text-xs text-muted leading-relaxed">
                O novo valor será utilizado como referência no catálogo.
                Os preços personalizados dos usuários serão preservados.
                </p>

                {saveError && (
                <p
                    role="alert"
                    className="text-sm text-danger"
                >
                    {saveError}
                </p>
                )}

                <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={() => setEditing(null)}
                    disabled={saving}
                    className="btn-secondary flex-1"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex-1"
                >
                    {saving ? "Salvando..." : "Salvar preço"}
                </button>
                </div>
            </div>
            </form>
        </div>
        )}
 

    </div>
  )
}
