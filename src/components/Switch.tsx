interface Props {
  checked: boolean
  onChange: () => void
  label: string
}

export default function Switch({ checked, onChange, label }: Props) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
        checked ? "bg-brand" : "bg-line-strong"
      }`}
    >
      <span
        className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  )
}
