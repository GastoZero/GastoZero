interface Props {
  eyebrow?: string
  title: React.ReactNode
  description?: string
  actions?: React.ReactNode
  children?: React.ReactNode
}

export default function PageHeader({ eyebrow, title, description, actions, children }: Props) {
  return (
    <header className="px-4 md:px-10 pt-5 md:pt-8 pb-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h1 className="text-[1.75rem] md:text-[2.1rem] font-bold text-ink leading-[1.1]">{title}</h1>
          {description && <p className="text-sm text-muted mt-2 max-w-xl">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
      {children}
    </header>
  )
}
