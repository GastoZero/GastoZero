import Logo from "./Logo"


/** Moldura das telas de entrada: painel da marca à esquerda e formulário à direita. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-canvas flex">
      
      <aside className="hidden lg:block relative w-[460px] xl:w-[520px] flex-shrink-0 overflow-hidden bg-[#0B1B28]">
        <img
          src="/banner-login.png"
          alt="GastoZero — Menos surpresas. Mais tranquilidade."
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
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
