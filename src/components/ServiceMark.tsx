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

/** Monograma do serviço na cor da marca, no lugar dos antigos emojis. */
export default function ServiceMark({ name, color, size = "md" }: Props) {
  const bg = serviceColor(name, color)
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
      className={`${SIZES[size]} flex-shrink-0 inline-flex items-center justify-center font-display font-bold text-white tracking-tight ring-1 ring-inset ring-white/10`}
      style={{ background: bg }}
    >
      {letters || "?"}
    </span>
  )
}
