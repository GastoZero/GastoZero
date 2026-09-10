import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { User } from "../models/User.js"

const router = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function signToken(userId: string) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET não definida no .env")
  return jwt.sign({ sub: userId }, secret, { expiresIn: "7d" })
}

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body ?? {}

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Nome é obrigatório." })
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "E-mail inválido." })
  }
  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ error: "Senha deve ter ao menos 6 caracteres." })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const existing = await User.findOne({ email: normalizedEmail })
  if (existing) {
    return res.status(409).json({ error: "Já existe uma conta com este e-mail." })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash })

  const token = signToken(user.id)
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  })
})

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {}

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const user = await User.findOne({ email: normalizedEmail })
  if (!user) {
    return res.status(401).json({ error: "E-mail ou senha inválidos." })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ error: "E-mail ou senha inválidos." })
  }

  const token = signToken(user.id)
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  })
})

export default router
