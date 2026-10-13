import dns from "node:dns"
import mongoose from "mongoose"

// Em algumas redes no Windows o Node só enxerga 127.0.0.1 como DNS e a
// consulta SRV do "mongodb+srv://" falha com ECONNREFUSED. Nesse caso
// usamos DNS públicos (ou os definidos em DNS_SERVERS no .env).
function ensureDnsForSrv(uri: string) {
  if (!uri.startsWith("mongodb+srv://")) return
  const custom = process.env.DNS_SERVERS?.split(",").map(s => s.trim()).filter(Boolean)
  const onlyLoopback = dns.getServers().every(s => s === "127.0.0.1" || s === "::1")
  if (custom?.length) dns.setServers(custom)
  else if (onlyLoopback) dns.setServers(["8.8.8.8", "1.1.1.1"])
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI não definida no .env")

  ensureDnsForSrv(uri)

  mongoose.set("strictQuery", true)
  await mongoose.connect(uri)
  console.log("MongoDB conectado")
}
