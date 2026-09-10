import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

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
