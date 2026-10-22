import "dotenv/config"
import express from "express"
import cors from "cors"
import { connectDB } from "./db.js"
import authRoutes from "./routes/auth.js"
import meRoutes from "./routes/me.js"
import subscriptionRoutes from "./routes/subscriptions.js"
import catalogRoutes from "./routes/catalog.js"
import adminRoutes from "./routes/admin.js"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/api/health", (_req, res) => res.json({ ok: true }))
app.use("/api/auth", authRoutes)
app.use("/api/me", meRoutes)
app.use("/api/subscriptions", subscriptionRoutes)
app.use("/api/catalog", catalogRoutes)
app.use("/api/admin", adminRoutes)

app.use("/api", (_req, res) => res.status(404).json({ error: "Rota não encontrada." }))

// Express 5 encaminha erros de handlers async para cá.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: "Erro interno do servidor." })
})

const port = Number(process.env.PORT) || 3001

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`API rodando em http://localhost:${port}`))
  })
  .catch(err => {
    console.error("Falha ao conectar no MongoDB:", err)
    process.exit(1)
  })
