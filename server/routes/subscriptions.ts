import { Router } from "express"
import { isValidObjectId } from "mongoose"
import { requireAuth, type AuthRequest } from "../middleware/auth.js"
import { Subscription, type SubscriptionDoc } from "../models/Subscription.js"

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
  if ("error" in parsed) return res.status(400).json({ error: parsed.error })

  const sub = await Subscription.create({ ...(parsed.data as Partial<SubscriptionDoc>), user: req.userId })
  res.status(201).json(sub)
})

router.patch("/:id", async (req: AuthRequest, res) => {
  const id = String(req.params.id)
  if (!isValidObjectId(id)) return res.status(404).json({ error: "Assinatura não encontrada." })

  const parsed = parseFields(req.body, true)
  if ("error" in parsed) return res.status(400).json({ error: parsed.error })

  const sub = await Subscription.findOneAndUpdate(
    { _id: id, user: req.userId },
    { $set: parsed.data },
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
