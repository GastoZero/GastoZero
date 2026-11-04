import "dotenv/config"
import express from "express"
import cors from "cors"
import { connectDB } from "./db.js"
import authRoutes from "./routes/auth.js"
import meRoutes from "./routes/me.js"
import subscriptionRoutes from "./routes/subscriptions.js"
import catalogRoutes from "./routes/catalog.js"
import adminRoutes from "./routes/admin.js"
import rateRoutes from "./routes/rates.js"

/**
 * App Express sem `listen`: usado pelo servidor local (server/index.ts)
 * e pela função serverless da Vercel (api/index.ts).
 */
const app = express()

app.use(cors())
app.use(express.json())

app.get("/api/health", (_req, res) => res.json({ ok: true }))

// Na Vercel cada instância conecta na primeira requisição; depois reaproveita a conexão.
app.use("/api", async (_req, _res, next) => {
  await connectDB()
  next()
})

app.use("/api/auth", authRoutes)
app.use("/api/me", meRoutes)
app.use("/api/subscriptions", subscriptionRoutes)
app.use("/api/catalog", catalogRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/rates", rateRoutes)

app.use("/api", (_req, res) => res.status(404).json({ error: "Rota não encontrada." }))

// Express 5 encaminha erros de handlers async para cá.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: "Erro interno do servidor." })
})

export default app
