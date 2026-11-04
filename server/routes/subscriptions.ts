import { Router } from "express"
import { isValidObjectId } from "mongoose"
import { requireAuth, type AuthRequest } from "../middleware/auth.js"
import { Subscription, type SubscriptionDoc } from "../models/Subscription.js"
import { Service } from "../models/Service.js"
import { parseFields, updatesFor } from "../lib/subscriptionFields.js"

const router = Router()
router.use(requireAuth)

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

  const updates = updatesFor(parsed.data)

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
