import { Router } from "express"
import bcrypt from "bcryptjs"
import { requireAuth, type AuthRequest } from "../middleware/auth.js"
import { User, toPublicUser } from "../models/User.js"
import { isCurrencyCode } from "../currencies.js"

const router = Router()
router.use(requireAuth)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

router.patch("/", async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId)
  if (!user) return res.status(401).json({ error: "Usuário não encontrado." })

  const { name, email, notifications, currency } = req.body ?? {}

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Nome é obrigatório." })
    }
    user.name = name.trim()
  }

  if (email !== undefined) {
    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ error: "E-mail inválido." })
    }
    const normalizedEmail = email.trim().toLowerCase()
    if (normalizedEmail !== user.email) {
      const taken = await User.exists({ email: normalizedEmail })
      if (taken) return res.status(409).json({ error: "Já existe uma conta com este e-mail." })
      user.email = normalizedEmail
    }
  }

  if (notifications !== undefined) {
    if (typeof notifications !== "object" || notifications === null) {
      return res.status(400).json({ error: "Preferências de notificação inválidas." })
    }
    for (const key of ["billing", "renewal"] as const) {
      if (!(key in notifications)) continue
      if (typeof notifications[key] !== "boolean") {
        return res.status(400).json({ error: "Preferências de notificação inválidas." })
      }
      user.set(`notifications.${key}`, notifications[key])
    }
  }

  if (currency !== undefined) {
    if (!isCurrencyCode(currency)) return res.status(400).json({ error: "Moeda inválida." })
    user.currency = currency
  }

  await user.save()
  res.json({ user: toPublicUser(user) })
})

router.post("/password", async (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body ?? {}

  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return res.status(400).json({ error: "Informe a senha atual e a nova senha." })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "A nova senha deve ter ao menos 6 caracteres." })
  }

  const user = await User.findById(req.userId)
  if (!user) return res.status(401).json({ error: "Usuário não encontrado." })

  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) return res.status(400).json({ error: "Senha atual incorreta." })

  user.passwordHash = await bcrypt.hash(newPassword, 10)
  await user.save()
  res.status(204).end()
})

export default router
