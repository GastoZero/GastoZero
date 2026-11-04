import type { InputHTMLAttributes } from "react"
import { sanitizePriceInput } from "../lib/format"

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "inputMode"> & {
  value: string
  onChange: (value: string) => void
}

/** Campo de valor em dinheiro: aceita só números e uma vírgula para os centavos. */
export default function PriceInput({ value, onChange, className = "input num", placeholder = "29,90", ...rest }: Props) {
  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={value}
      onChange={e => onChange(sanitizePriceInput(e.target.value))}
      placeholder={placeholder}
      className={className}
    />
  )
}
