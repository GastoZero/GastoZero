import { Router } from "express"
import { isValidObjectId } from "mongoose"
import { requireAuth, type AuthRequest } from "../middleware/auth.js"
import { Subscription, type SubscriptionDoc } from "../models/Subscription.js"
import { Service } from "../models/Service.js"

const router = Router()
router.use(requireAuth)

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const FIELDS = ["name", "plan", "category", "price", "cycle", "nextBilling", "status", "color"] as const
const OPTIONAL = new Set<string>(["status", "color"])

type Fields = Partial<Record<(typeof FIELDS)[number], unknown>>

/** Valida e filtra os campos do corpo. Com `partial`, só checa o que foi enviado. */
function parseFields(body: unknown, partial: boolean): { data: Fields } | { error: string } {
  const src = (body ?? {}) as Record<string, unknown>
  const data: Fields = {}

  for (const key of FIELDS) {
    if (src[key] === undefined) {
      if (!partial && !OPTIONAL.has(key)) return { error: `Campo "${key}" é obrigatório.` }
      continue
    }
    data[key] = src[key]
  }

  for (const key of ["name", "plan", "category"] as const) {
    if (key in data && (typeof data[key] !== "string" || !(data[key] as string).trim())) {
      return { error: `Campo "${key}" inválido.` }
    }
  }
  if ("price" in data && (typeof data.price !== "number" || !Number.isFinite(data.price) || data.price < 0)) {
    return { error: "Preço inválido." }
  }
  if ("cycle" in data && data.cycle !== "monthly" && data.cycle !== "yearly") {
    return { error: "Ciclo inválido." }
  }
  if ("status" in data && data.status !== "active" && data.status !== "paused") {
    return { error: "Status inválido." }
  }
  if ("nextBilling" in data && (typeof data.nextBilling !== "string" || !ISO_DATE_RE.test(data.nextBilling))) {
    return { error: "Data de cobrança inválida (use AAAA-MM-DD)." }
  }
  if ("color" in data && typeof data.color !== "string") {
    return { error: "Cor inválida." }
  }

  return { data }
}

router.get("/", async (req: AuthRequest, res) => {
  const subs = await Subscription.find({ user: req.userId }).sort({ createdAt: 1 })
  res.json(subs)
})


router.post("/", async (req: AuthRequest, res) => {
  const parsed = parseFields(req.body, false)

  if ("error" in parsed) {
    return res.status(400).json({ error: parsed.error })
  }

  
  const data = {
    ...(parsed.data as Partial<SubscriptionDoc>)
  }

  const { catalogServiceId, priceMode } = req.body ?? {}

  if (
    priceMode !== undefined &&
    priceMode !== "catalog" &&
    priceMode !== "custom"
  ) {
    return res.status(400).json({
      error: "Modo de preço inválido."
    })
  }

  // Cadastro de um serviço do catálogo oficial
  if (catalogServiceId != null) {
    if (
      typeof catalogServiceId !== "number" ||
      !Number.isSafeInteger(catalogServiceId) ||
      catalogServiceId <= 0
    ) {
      return res.status(400).json({
        error: "Identificador do catálogo inválido."
      })
    }

    const service = await Service.findOne({
      id: catalogServiceId
    })

    if (!service) {
      return res.status(404).json({
        error: "Serviço não encontrado no catálogo."
      })
    }

    const plan = service.plans.find(
      p => p.label === data.plan && p.cycle === data.cycle
    )

    if (!plan) {
      return res.status(400).json({
        error: "Plano não encontrado no catálogo."
      })
    }

    const followsCatalog = priceMode === "catalog"

    const sub = await Subscription.create({
      ...data,
      user: req.userId,

      // Informações oficiais do serviço
      name: service.name,
      category: service.category,
      color: service.color,
      catalogServiceId: service.id,

      // O servidor define o preço padrão
      price: followsCatalog ? plan.price : data.price,
      priceMode: followsCatalog ? "catalog" : "custom"
    })

    return res.status(201).json(sub)
  }

  // Cadastro de serviço personalizado
  if (priceMode === "catalog") {
    return res.status(400).json({
      error: "Serviços personalizados não seguem o catálogo."
    })
  }

  const sub = await Subscription.create({
    ...data,
    user: req.userId,
    catalogServiceId: null,
    priceMode: "custom"
  })

  return res.status(201).json(sub)
})


router.patch("/:id", async (req: AuthRequest, res) => {
  const id = String(req.params.id)
  if (!isValidObjectId(id)) return res.status(404).json({ error: "Assinatura não encontrada." })

  const parsed = parseFields(req.body, true)
  if ("error" in parsed) return res.status(400).json({ error: parsed.error })

  const updates: Record<string, unknown> = {
    ...parsed.data
  }

  // Quando o usuário altera o preço, ele se torna personalizado.
  if ("price" in parsed.data) {
    updates.priceMode = "custom"
  }

  // Se mudar o serviço ou o plano, perde o vínculo anterior.
  if (
    "name" in parsed.data ||
    "plan" in parsed.data ||
    "cycle" in parsed.data
  ) {
    updates.catalogServiceId = null
    updates.priceMode = "custom"
  }

  const sub = await Subscription.findOneAndUpdate(
    { _id: id, user: req.userId },
    { $set: updates },
    { new: true, runValidators: true },
  )
  if (!sub) return res.status(404).json({ error: "Assinatura não encontrada." })
  res.json(sub)
})

router.delete("/:id", async (req: AuthRequest, res) => {
  const id = String(req.params.id)
  if (!isValidObjectId(id)) return res.status(404).json({ error: "Assinatura não encontrada." })

  const result = await Subscription.deleteOne({ _id: id, user: req.userId })
  if (result.deletedCount === 0) return res.status(404).json({ error: "Assinatura não encontrada." })
  res.status(204).end()
})

export default router
