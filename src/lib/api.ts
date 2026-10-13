import type { NotificationPrefs, StoredSubscription } from "../types"

export interface AuthUser {
  id: string
  name: string
  email: string
  notifications: NotificationPrefs
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export type SubscriptionInput = Omit<StoredSubscription, "id">

const TOKEN_KEY = "gastozero:token"

/** Erro da API com o status HTTP (401 indica sessão inválida/expirada). */
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

/** "Lembrar de mim" marcado → localStorage; desmarcado → sessionStorage (some ao fechar o navegador). */
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string, remember = true) {
  clearToken()
  try {
    ;(remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token)
  } catch {
    /* storage indisponível */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage indisponível */
  }
}

let onUnauthorized: (() => void) | null = null

/** Chamado quando uma requisição autenticada recebe 401 (token expirado ou inválido). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (body !== undefined) headers["Content-Type"] = "application/json"
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError("Sem conexão com o servidor.", 0)
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.()
    const fallback =
      res.status >= 500 ? "Servidor indisponível. Tente novamente em instantes." : "Não foi possível completar a solicitação."
    throw new ApiError(data?.error || fallback, res.status)
  }
  return data as T
}

export function login(email: string, password: string) {
  return request<AuthResponse>("POST", "/auth/login", { email, password })
}

export function register(name: string, email: string, password: string) {
  return request<AuthResponse>("POST", "/auth/register", { name, email, password })
}

export function fetchMe() {
  return request<{ user: AuthUser }>("GET", "/auth/me")
}

export function updateMe(updates: Partial<Pick<AuthUser, "name" | "email" | "notifications">>) {
  return request<{ user: AuthUser }>("PATCH", "/me", updates)
}

export function changePassword(currentPassword: string, newPassword: string) {
  return request<null>("POST", "/me/password", { currentPassword, newPassword })
}

export function listSubscriptions() {
  return request<StoredSubscription[]>("GET", "/subscriptions")
}

export function createSubscription(sub: SubscriptionInput) {
  return request<StoredSubscription>("POST", "/subscriptions", sub)
}

export function updateSubscription(id: string, updates: Partial<SubscriptionInput>) {
  return request<StoredSubscription>("PATCH", `/subscriptions/${id}`, updates)
}

export function deleteSubscription(id: string) {
  return request<null>("DELETE", `/subscriptions/${id}`)
}
