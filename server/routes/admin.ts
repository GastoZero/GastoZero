import { Router } from "express"
import bcrypt from "bcryptjs"
import { isValidObjectId } from "mongoose"
import { requireAdmin, requireAuth } from "../middleware/auth.js"
import { User } from "../models/User.js"
import { Subscription } from "../models/Subscription.js"
import { monthlyCost } from "../../src/lib/format.js"

const router = Router()
router.use(requireAuth, requireAdmin)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NOT_ADMIN = { role: { $ne: "admin" as const } }

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
  const users = await User.find(NOT_ADMIN).select("_id").lean()
  const subs = await Subscription.find({ user: { $in: users.map(u => u._id) }, status: "active" }).lean()

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

export default router
