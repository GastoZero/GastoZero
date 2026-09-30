import Logo from "./Logo"

const SAMPLE = [
  { name: "Streaming", value: "59,90" },
  { name: "Música", value: "21,90" },
  { name: "Nuvem", value: "10,90" },
  { name: "Academia", value: "99,90" },
]

/** Moldura das telas de entrada: painel da marca à esquerda e formulário à direita. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-canvas flex">
      <aside className="hidden lg:flex flex-col w-[460px] xl:w-[520px] bg-hero text-on-hero relative overflow-hidden p-12">
        <svg
          aria-hidden="true"
          viewBox="0 0 200 200"
          className="absolute -right-24 top-1/3 w-[420px] h-[420px] opacity-[0.07] pointer-events-none"
        >
          <circle cx="100" cy="100" r="64" fill="none" stroke="#4fe08f" strokeWidth="14" />
          <path d="M52 148 L148 52" stroke="#4fe08f" strokeWidth="14" strokeLinecap="round" />
        </svg>

        <Logo onDark size={32} />

        <div className="mt-auto relative">
          <h1 className="font-display text-[2.6rem] font-bold leading-[1.05] tracking-[-0.03em]">
            Todo mês sai um pouco.
            <br />
            <span className="text-hero-accent">Saiba pra onde.</span>
          </h1>
          <p className="text-hero-muted text-base leading-relaxed mt-5 max-w-sm">
            Junte suas assinaturas, veja o que vence nos próximos dias e decida o que ainda vale a pena pagar.
          </p>

          <div className="mt-10 rounded-xl bg-hero-2 border border-white/5 p-5 max-w-sm font-mono text-sm">
            {SAMPLE.map(row => (
              <div key={row.name} className="flex justify-between py-1.5 text-hero-muted">
                <span>{row.name}</span>
                <span className="tabular-nums">R$ {row.value}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 mt-2 border-t border-dashed border-white/15 text-on-hero font-semibold">
              <span>Por mês</span>
              <span className="tabular-nums text-hero-accent">R$ 192,60</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-10">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
