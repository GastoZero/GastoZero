import "dotenv/config"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"
import { connectDB } from "../db.js"
import { User } from "../models/User.js"

/**
 * Cria (ou promove) uma conta de administrador.
 * Uso: npm run create-admin -- <email> <senha> [nome]
 * Se o e-mail já existir, a conta vira admin e recebe a nova senha.
 */
async function createAdmin() {
  const [email, password, name = "Administrador"] = process.argv.slice(2)
  if (!email || !password || password.length < 6) {
    console.error("Uso: npm run create-admin -- <email> <senha (mín. 6)> [nome]")
    process.exit(1)
  }

  try {
    await connectDB()
    const passwordHash = await bcrypt.hash(password, 10)
    await User.updateOne(
      { email: email.trim().toLowerCase() },
      { $set: { role: "admin", passwordHash }, $setOnInsert: { name } },
      { upsert: true },
    )
    console.log(`Administrador ${email} pronto para entrar.`)
  } finally {
    await mongoose.disconnect()
  }
}

createAdmin()
