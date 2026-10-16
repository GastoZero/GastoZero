
import { Schema, model } from "mongoose"

const planSchema = new Schema(
  {
    label: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    cycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true
    },
    priceUpdatedAt: {
      type: String,
      required: true
    }
  },
  { _id: false }
)

const serviceSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    color: { type: String, required: true },
    plans: [planSchema]
  },
  {
    collection: "services",
    timestamps: true
  }
)

export const Service = model("Service", serviceSchema)
