import { Schema, model, Types, type InferSchemaType } from "mongoose"

const subscriptionSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    plan: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    catalogServiceId: { type: Number, default: null},
    priceMode: { type: String, enum: ["catalog", "custom"], default: "custom" },
    cycle: { type: String, enum: ["monthly", "yearly"], required: true },
    nextBilling: { type: String, required: true },
    status: { type: String, enum: ["active", "paused"], required: true, default: "active" },
    /** Cor da marca do serviço (hex), vinda do catálogo. */
    color: { type: String },
    /** Legado: emoji usado em versões anteriores. */
    icon: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id)
        delete ret._id
        delete ret.user
        return ret
      },
    },
  },
)

export type SubscriptionDoc = InferSchemaType<typeof subscriptionSchema>
export const Subscription = model("Subscription", subscriptionSchema)
