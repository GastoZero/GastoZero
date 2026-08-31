import { useEffect, useState } from "react"

const PREFIX = "gastozero:"

function read<T>(key: string, fallback: () => T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? fallback() : (JSON.parse(raw) as T)
  } catch {
    return fallback()
  }
}

/** useState persistido em localStorage — camada de dados até a API REST existir. */
export function usePersistentState<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() =>
    read(key, () => (typeof initial === "function" ? (initial as () => T)() : initial)),
  )

  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      /* quota excedida ou storage indisponível: segue apenas em memória */
    }
  }, [key, value])

  return [value, setValue] as const
}

export function clearStoredState() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(PREFIX)) localStorage.removeItem(key)
    }
  } catch {
    /* storage indisponível */
  }
}
