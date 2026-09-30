import { useEffect, useState } from "react"
import type { ThemePreference } from "../types"

const media = () => window.matchMedia("(prefers-color-scheme: dark)")

/** Aplica a classe `.dark` no <html> conforme a preferência e devolve se o tema ativo é escuro. */
export function useAppliedTheme(preference: ThemePreference): boolean {
  const [systemDark, setSystemDark] = useState(() => media().matches)

  useEffect(() => {
    const mq = media()
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const isDark = preference === "dark" || (preference === "system" && systemDark)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", isDark ? "#0a1521" : "#f1f3ef")
  }, [isDark])

  return isDark
}
