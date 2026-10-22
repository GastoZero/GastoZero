/** Placeholder enquanto os dados da API não chegam (ou quando a busca falha). */
export default function DataState({ error }: { error: string }) {
  return (
    <p role={error ? "alert" : undefined} className={`card p-10 text-center text-sm ${error ? "text-danger" : "text-muted"}`}>
      {error || "Carregando..."}
    </p>
  )
}
