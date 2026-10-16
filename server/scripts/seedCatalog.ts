
import "dotenv/config"
import mongoose from "mongoose"
import { connectDB } from "../db.js"
import { Service } from "../models/Service.js"
import {
  CATALOG,
  CATALOG_UPDATED_AT
} from "../../src/data/catalog.js"

async function seedCatalog() {
  try {
    await connectDB()

    for (const service of CATALOG) {
      await Service.updateOne(
        { id: service.id },
        {
          $setOnInsert: {
            id: service.id,
            name: service.name,
            category: service.category,
            color: service.color,
            plans: service.plans.map(plan => ({
              label: plan.label,
              price: plan.price,
              cycle: plan.cycle,
              priceUpdatedAt: CATALOG_UPDATED_AT
            }))
          }
        },
        { upsert: true }
      )
    }

    console.log("Catálogo migrado com sucesso!")
  } finally {
    await mongoose.disconnect()
  }
}

seedCatalog().catch(error => {
  console.error("Erro na migração:", error)
  process.exitCode = 1
})
