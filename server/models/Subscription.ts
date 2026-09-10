import { Schema, model, Types, type InferSchemaType } from "mongoose"

const subscriptionSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    plan: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    cycle: { type: String, enum: ["monthly", "yearly"], required: true },
    nextBilling: { type: String, required: true },
    status: { type: String, enum: ["active", "paused"], required: true, default: "active" },
    icon: { type: String, required: true },
  },
  { timestamps: true },
)

export type SubscriptionDoc = InferSchemaType<typeof subscriptionSchema>
export const Subscription = model("Subscription", subscriptionSchema)
