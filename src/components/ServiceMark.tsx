
import { serviceColor } from "../data/catalog"

interface Props {
  name: string
  color?: string
  size?: "sm" | "md" | "lg"
}

const SIZES = {
  sm: "w-8 h-8 text-[13px] rounded-lg",
  md: "w-10 h-10 text-[15px] rounded-[10px]",
  lg: "w-12 h-12 text-lg rounded-xl",
}

export default function ServiceMark({
  name,
  color,
  size = "md",
}: Props) {
  const originalColor = serviceColor(name, color)

  // Mistura a cor original com o fundo neutro.
  const softBackground = `color-mix(in srgb, ${originalColor} 25%, var(--color-sunken))`

  const softBorder = `color-mix(in srgb, ${originalColor} 20%, var(--color-line))`

  const letters = name
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase()

  return (
    <span
      aria-hidden="true"
      className={`${SIZES[size]} flex-shrink-0 inline-flex items-center justify-center font-semibold text-ink tracking-tight border`}
      style={{
        backgroundColor: softBackground,
        borderColor: softBorder,
      }}
    >
      {letters || "?"}
    </span>
  )
}
