import { Router } from "express"
import bcrypt from "bcryptjs"
import mongoose, { isValidObjectId } from "mongoose"
import { requireAdmin, requireAuth } from "../middleware/auth.js"
import { User } from "../models/User.js"
import { Subscription } from "../models/Subscription.js"
import { monthlyCost } from "../../src/lib/format.js"
import { Service } from "../models/Service.js"

const router = Router()
router.use(requireAuth, requireAdmin)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NOT_ADMIN = { role: { $ne: "admin" as const } }

/** Quantos meses o gráfico de crescimento mostra (incluindo o atual). */
const GROWTH_MONTHS = 6

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`

/** Conta cadastros de usuários e de assinaturas por mês nos últimos GROWTH_MONTHS meses. */
function growthByMonth(userDates: Date[], subDates: Date[]) {
  const now = new Date()
  const points = Array.from({ length: GROWTH_MONTHS }, (_, i) => ({
    month: monthKey(new Date(now.getFullYear(), now.getMonth() - (GROWTH_MONTHS - 1 - i), 1)),
    users: 0,
    subscriptions: 0,
  }))
  const byKey = new Map(points.map(p => [p.month, p]))
  for (const d of userDates) {
    const p = byKey.get(monthKey(new Date(d)))
    if (p) p.users++
  }
  for (const d of subDates) {
    const p = byKey.get(monthKey(new Date(d)))
    if (p) p.subscriptions++
  }
  return points
}

const summary = (u: { id: string; name: string; email: string; createdAt: Date }) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  createdAt: u.createdAt,
})

/** Usuários padrão com quantidade de assinaturas e gasto mensal das ativas. */
router.get("/users", async (_req, res) => {
  const users = await User.find(NOT_ADMIN).sort({ createdAt: -1 })
  const subs = await Subscription.find({ user: { $in: users.map(u => u._id) } }).lean()

  const totals: Record<string, { subscriptions: number; monthlyTotal: number }> = {}
  for (const s of subs) {
    const t = (totals[String(s.user)] ??= { subscriptions: 0, monthlyTotal: 0 })
    t.subscriptions++
    if (s.status === "active") t.monthlyTotal += monthlyCost(s.price, s.cycle)
  }

  res.json(users.map(u => ({ ...summary(u), ...(totals[u.id] ?? { subscriptions: 0, monthlyTotal: 0 }) })))
})

router.get("/users/:id/subscriptions", async (req, res) => {
  const id = String(req.params.id)
  if (!isValidObjectId(id)) return res.status(404).json({ error: "Usuário não encontrado." })
  const subs = await Subscription.find({ user: id }).sort({ createdAt: 1 })
  res.json(subs)
})

/** Indicadores gerais considerando só as assinaturas ativas dos usuários padrão. */
router.get("/stats", async (_req, res) => {
  const users = await User.find(NOT_ADMIN).select("_id createdAt").lean()
  const userIds = users.map(u => u._id)
  const subs = await Subscription.find({ user: { $in: userIds }, status: "active" }).lean()
  // Crescimento conta todas as assinaturas criadas (ativas e pausadas).
  const allSubDates = await Subscription.find({ user: { $in: userIds } }).select("createdAt").lean()

  const group = (key: "category" | "name") => {
    const map: Record<string, { name: string; count: number; value: number }> = {}
    for (const s of subs) {
      const g = (map[s[key]] ??= { name: s[key], count: 0, value: 0 })
      g.count++
      g.value += monthlyCost(s.price, s.cycle)
    }
    return Object.values(map)
  }

  const monthlyTotal = subs.reduce((sum, s) => sum + monthlyCost(s.price, s.cycle), 0)
  const payingUsers = new Set(subs.map(s => String(s.user))).size

  res.json({
    users: users.length,
    payingUsers,
    activeSubscriptions: subs.length,
    monthlyTotal,
    avgPerUser: payingUsers ? monthlyTotal / payingUsers : 0,
    byCategory: group("category").sort((a, b) => b.value - a.value),
    services: group("name").sort((a, b) => b.count - a.count || b.value - a.value),
    growth: growthByMonth(
      users.map(u => u.createdAt),
      allSubDates.map(s => s.createdAt),
    ),
  })
})

router.get("/admins", async (_req, res) => {
  const admins = await User.find({ role: "admin" }).sort({ createdAt: 1 })
  res.json(admins.map(summary))
})

router.post("/admins", async (req, res) => {
  const { name, email, password } = req.body ?? {}

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Nome é obrigatório." })
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ error: "E-mail inválido." })
  }
  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ error: "Senha deve ter ao menos 6 caracteres." })
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (await User.exists({ email: normalizedEmail })) {
    return res.status(409).json({ error: "Já existe uma conta com este e-mail." })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const admin = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash, role: "admin" })
  res.status(201).json(summary(admin))
})


/**
 * Atualiza o preço de um plano do catálogo oficial.
 * Acesso exclusivo para administradores.
 */

router.patch("/catalog/:serviceId/price", async (req, res) => {
  const serviceId = Number(req.params.serviceId)
  const { label, cycle, price } = req.body ?? {}

  if (!Number.isSafeInteger(serviceId) || serviceId <= 0) {
    return res.status(400).json({
      error: "Serviço inválido."
    })
  }

  if (
    typeof label !== "string" ||
    !label.trim() ||
    !["monthly", "yearly"].includes(cycle)
  ) {
    return res.status(400).json({
      error: "Plano inválido."
    })
  }

  if (
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > 999999 ||
    Math.round(price * 100) !== price * 100 &&
    Math.abs(Math.round(price * 100) - price * 100) > 0.000001
  ) {
    return res.status(400).json({
      error: "Informe um preço válido."
    })
  }

  const updatedAt = new Date().toISOString().slice(0, 10)

  // A transação mantém catálogo e assinaturas sincronizados.
  const result = await mongoose.connection.transaction(
    async session => {

      // 1. Atualiza o preço do plano oficial
      const service = await Service.findOneAndUpdate(
        {
          id: serviceId,
          plans: {
            $elemMatch: { label, cycle }
          }
        },
        {
          $set: {
            "plans.$.price": price,
            "plans.$.priceUpdatedAt": updatedAt
          }
        },
        {
          new: true,
          runValidators: true,
          session
        }
      )
        .select("id name category color plans -_id")
        .lean()

      if (!service) return null

      // 2. Atualiza apenas assinaturas que seguem o catálogo
      const sync = await Subscription.updateMany(
        {
          catalogServiceId: serviceId,
          plan: label,
          cycle,
          priceMode: "catalog"
        },
        {
          $set: { price }
        },
        { session }
      )

      return {
        service,
        subscriptionsUpdated: sync.modifiedCount
      }
    }
  )

  if (!result) {
    return res.status(404).json({
      error: "Serviço ou plano não encontrado."
    })
  }

  res.json({
    ...result.service,
    subscriptionsUpdated: result.subscriptionsUpdated
  })
})


export default router
