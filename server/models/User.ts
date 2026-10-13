import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose"

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    notifications: {
      billing: { type: Boolean, default: true },
      renewal: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
)

export type UserDoc = InferSchemaType<typeof userSchema>
export const User = model("User", userSchema)

/** Formato público do usuário enviado ao front (nunca inclui o hash da senha). */
export function toPublicUser(user: HydratedDocument<UserDoc>) {
  return {
    id: user.id as string,
    name: user.name,
    email: user.email,
    notifications: {
      billing: user.notifications?.billing ?? true,
      renewal: user.notifications?.renewal ?? true,
    },
  }
}
