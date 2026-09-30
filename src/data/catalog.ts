import type { CatalogService } from "../types"

/**
 * Catálogo global pré-alimentado: o usuário escolhe serviço + plano e o preço
 * já vem preenchido. Valores de referência em BRL — ajuste conforme a tabela
 * oficial vigente de cada serviço.
 */
export const CATALOG_UPDATED_AT = "2025-01"

export const CATEGORIES = [
  "Streaming",
  "Música",
  "Cloud",
  "Academia",
  "Telefonia",
  "Software",
  "Games",
] as const

export const CATALOG: CatalogService[] = [
  {
    id: 1, name: "Netflix", category: "Streaming", color: "#E50914",
    plans: [
      { label: "Padrão com anúncios", price: 20.90, cycle: "monthly" },
      { label: "Padrão", price: 44.90, cycle: "monthly" },
      { label: "Premium", price: 59.90, cycle: "monthly" },
    ],
  },
  {
    id: 2, name: "Spotify", category: "Música", color: "#1DB954",
    plans: [
      { label: "Universitário", price: 11.90, cycle: "monthly" },
      { label: "Individual", price: 21.90, cycle: "monthly" },
      { label: "Duo", price: 27.90, cycle: "monthly" },
      { label: "Família", price: 34.90, cycle: "monthly" },
    ],
  },
  {
    id: 3, name: "iCloud+", category: "Cloud", color: "#3B82F6",
    plans: [
      { label: "50 GB", price: 3.50, cycle: "monthly" },
      { label: "200 GB", price: 10.90, cycle: "monthly" },
      { label: "2 TB", price: 34.90, cycle: "monthly" },
    ],
  },
  {
    id: 4, name: "YouTube Premium", category: "Streaming", color: "#FF0000",
    plans: [
      { label: "Estudante", price: 13.90, cycle: "monthly" },
      { label: "Individual", price: 24.90, cycle: "monthly" },
      { label: "Família", price: 41.90, cycle: "monthly" },
    ],
  },
  {
    id: 5, name: "Amazon Prime", category: "Streaming", color: "#FF9900",
    plans: [
      { label: "Mensal", price: 19.90, cycle: "monthly" },
      { label: "Anual", price: 199.00, cycle: "yearly" },
    ],
  },
  {
    id: 6, name: "Disney+", category: "Streaming", color: "#113CCF",
    plans: [
      { label: "Padrão com anúncios", price: 18.90, cycle: "monthly" },
      { label: "Padrão", price: 27.90, cycle: "monthly" },
      { label: "Premium", price: 46.90, cycle: "monthly" },
    ],
  },
  {
    id: 7, name: "Max", category: "Streaming", color: "#742FEE",
    plans: [
      { label: "Básico com anúncios", price: 19.90, cycle: "monthly" },
      { label: "Padrão", price: 29.90, cycle: "monthly" },
      { label: "Premium", price: 55.90, cycle: "monthly" },
    ],
  },
  {
    id: 8, name: "Apple TV+", category: "Streaming", color: "#555555",
    plans: [
      { label: "Individual", price: 21.90, cycle: "monthly" },
    ],
  },
  {
    id: 9, name: "Globoplay", category: "Streaming", color: "#F04E23",
    plans: [
      { label: "Padrão com anúncios", price: 22.90, cycle: "monthly" },
      { label: "Padrão", price: 29.90, cycle: "monthly" },
      { label: "Premium", price: 54.90, cycle: "monthly" },
    ],
  },
  {
    id: 10, name: "Deezer", category: "Música", color: "#A238FF",
    plans: [
      { label: "Premium", price: 22.90, cycle: "monthly" },
      { label: "Família", price: 34.90, cycle: "monthly" },
    ],
  },
  {
    id: 11, name: "Google One", category: "Cloud", color: "#4285F4",
    plans: [
      { label: "100 GB", price: 8.99, cycle: "monthly" },
      { label: "200 GB", price: 13.99, cycle: "monthly" },
      { label: "2 TB", price: 44.99, cycle: "monthly" },
    ],
  },
  {
    id: 12, name: "Dropbox", category: "Cloud", color: "#0061FF",
    plans: [
      { label: "Plus", price: 59.90, cycle: "monthly" },
      { label: "Essentials", price: 89.90, cycle: "monthly" },
    ],
  },
  {
    id: 13, name: "Microsoft 365", category: "Software", color: "#0078D4",
    plans: [
      { label: "Personal (mensal)", price: 45.00, cycle: "monthly" },
      { label: "Personal (anual)", price: 379.00, cycle: "yearly" },
      { label: "Família (mensal)", price: 60.00, cycle: "monthly" },
    ],
  },
  {
    id: 14, name: "Canva Pro", category: "Software", color: "#00C4CC",
    plans: [
      { label: "Mensal", price: 39.90, cycle: "monthly" },
      { label: "Anual", price: 399.00, cycle: "yearly" },
    ],
  },
  {
    id: 15, name: "ChatGPT Plus", category: "Software", color: "#10A37F",
    plans: [
      { label: "Plus", price: 110.00, cycle: "monthly" },
    ],
  },
  {
    id: 16, name: "Duolingo Super", category: "Software", color: "#58CC02",
    plans: [
      { label: "Mensal", price: 49.90, cycle: "monthly" },
      { label: "Anual", price: 349.90, cycle: "yearly" },
    ],
  },
  {
    id: 17, name: "PlayStation Plus", category: "Games", color: "#0070D1",
    plans: [
      { label: "Essential (mensal)", price: 39.90, cycle: "monthly" },
      { label: "Extra (mensal)", price: 64.90, cycle: "monthly" },
      { label: "Deluxe (anual)", price: 619.90, cycle: "yearly" },
    ],
  },
  {
    id: 18, name: "Xbox Game Pass", category: "Games", color: "#107C10",
    plans: [
      { label: "Core", price: 29.99, cycle: "monthly" },
      { label: "Ultimate", price: 79.99, cycle: "monthly" },
    ],
  },
  {
    id: 19, name: "Academia", category: "Academia", color: "#F97316",
    plans: [
      { label: "Mensal", price: 99.90, cycle: "monthly" },
      { label: "Trimestral (por mês)", price: 89.90, cycle: "monthly" },
      { label: "Anual", price: 899.00, cycle: "yearly" },
    ],
  },
  {
    id: 20, name: "Plano de celular", category: "Telefonia", color: "#7C3AED",
    plans: [
      { label: "Pré-pago mensal", price: 35.00, cycle: "monthly" },
      { label: "Controle", price: 59.99, cycle: "monthly" },
      { label: "Pós-pago", price: 109.99, cycle: "monthly" },
    ],
  },
  {
    id: 21, name: "Internet residencial", category: "Telefonia", color: "#0EA5E9",
    plans: [
      { label: "300 Mega", price: 99.90, cycle: "monthly" },
      { label: "600 Mega", price: 129.90, cycle: "monthly" },
      { label: "1 Giga", price: 159.90, cycle: "monthly" },
    ],
  },
]

/** Cor de marca de um serviço pelo nome, com fallback estável por hash. */
export function serviceColor(name: string, fallback?: string): string {
  if (fallback) return fallback
  const match = CATALOG.find(s => s.name.toLowerCase() === name.toLowerCase())
  if (match) return match.color
  const palette = ["#2a78d6", "#d95926", "#1baf7a", "#c98500", "#d55181", "#4a3aa7", "#0e7490"]
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  return palette[Math.abs(hash) % palette.length]
}
