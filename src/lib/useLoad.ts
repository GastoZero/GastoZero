import { useCallback, useEffect, useState } from "react"

/**
 * Busca dados ao montar a tela. `load` precisa ser estável
 * (função do módulo api ou envolvida em useCallback). `reload` busca de novo.
 */
export function useLoad<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState("")

  const reload = useCallback(() => {
    setError("")
    load().then(setData, err => setError(err instanceof Error ? err.message : "Não foi possível carregar os dados."))
  }, [load])

  useEffect(reload, [reload])

  return { data, error, reload }
}
