import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { User } from "../models/User.js"

export interface AuthRequest extends Request {
  userId?: string
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: "Token de autenticação ausente." })
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error("JWT_SECRET não definida no .env")
    const payload = jwt.verify(token, secret) as { sub: string }
    req.userId = payload.sub
    next()
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado." })
  }
}

/** Usar depois de requireAuth: só deixa passar contas com role "admin". */
export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const isAdmin = await User.exists({ _id: req.userId, role: "admin" })
  if (!isAdmin) return res.status(403).json({ error: "Acesso restrito a administradores." })
  next()
}
