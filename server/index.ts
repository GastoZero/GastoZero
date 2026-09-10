import "dotenv/config"
import express from "express"
import cors from "cors"
import { connectDB } from "./db.js"
import authRoutes from "./routes/auth.js"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/api/health", (_req, res) => res.json({ ok: true }))
app.use("/api/auth", authRoutes)

const port = Number(process.env.PORT) || 3001

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`API rodando em http://localhost:${port}`))
  })
  .catch(err => {
    console.error("Falha ao conectar no MongoDB:", err)
    process.exit(1)
  })
