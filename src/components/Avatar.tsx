/** Círculo com a inicial do nome. */
export default function Avatar({ name }: { name: string }) {
  return (
    <div className="w-9 h-9 flex-shrink-0 rounded-full bg-hero text-hero-accent flex items-center justify-center font-display font-bold text-sm">
      {(name.trim()[0] ?? "?").toUpperCase()}
    </div>
  )
}
