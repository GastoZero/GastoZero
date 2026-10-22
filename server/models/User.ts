import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose"

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    /** "admin" só é definido pelo script create-admin ou por outro admin. */
    role: { type: String, enum: ["user", "admin"], default: "user" },
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
    role: user.role ?? "user",
    notifications: {
      billing: user.notifications?.billing ?? true,
      renewal: user.notifications?.renewal ?? true,
    },
  }
}
