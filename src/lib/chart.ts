/** Cores e estilos compartilhados pelos gráficos (recharts) nos dois temas. */
export function chartTheme(isDark: boolean) {
  return {
    grid: isDark ? "#1d3247" : "#e3e8e2",
    tick: isDark ? "#7c91a6" : "#687887",
    bar: isDark ? "#71AF9E" : "#346E61",
    /** Segunda série, para gráficos com duas linhas. */
    bar2: isDark ? "#7FA6C4" : "#446C88",
    cursor: isDark ? "rgba(113,175,158,0.10)" : "rgba(52,110,97,0.07)",
    tooltip: {
      borderRadius: 8,
      border: `1px solid ${isDark ? "#2a4560" : "#dbe1da"}`,
      background: isDark ? "#0f1d2c" : "#ffffff",
      color: isDark ? "#e6eef6" : "#0e1a26",
      fontSize: 12,
      fontFamily: "Geist Mono, monospace",
    },
  }
}
