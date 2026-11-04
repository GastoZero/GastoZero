import app from "./app.js"
import { connectDB } from "./db.js"

const port = Number(process.env.PORT) || 3001

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`API rodando em http://localhost:${port}`))
  })
  .catch(err => {
    console.error("Falha ao conectar no MongoDB:", err)
    process.exit(1)
  })
