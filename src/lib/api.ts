export interface AuthUser {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

const TOKEN_KEY = "gastozero:token"

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || "Não foi possível completar a solicitação.")
  }
  return data as T
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", { email, password })
}

export function register(name: string, email: string, password: string) {
  return request<AuthResponse>("/auth/register", { name, email, password })
}
