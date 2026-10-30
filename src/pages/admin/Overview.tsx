
import {
  Users,
  BarChart3,
  CreditCard,
  ShieldCheck,
  ArrowUpRight
} from "lucide-react"

import type { Page } from "../../types"
import PageHeader from "../../components/PageHeader"

interface Props {
  navigate: (page: Page) => void
}

const sections = [
  {
    title: "Usuários",
    description:
      "Gerencie contas e visualize as assinaturas cadastradas.",
    icon: Users,
    page: "users"
  },
  {
    title: "Relatórios",
    description:
      "Consulte indicadores, estatísticas e análises do sistema.",
    icon: BarChart3,
    page: "reports"
  },
  {
    title: "Assinaturas",
    description:
      "Gerencie os preços dos serviços disponíveis no catálogo.",
    icon: CreditCard,
    page: "admin-catalog"
  },
  {
    title: "Administradores",
    description:
      "Gerencie os perfis com acesso administrativo.",
    icon: ShieldCheck,
    page: "admins"
  }
] as const

export default function AdminOverview({ navigate }: Props) {
  return (
    <div className="min-h-full pb-24 md:pb-10">

      <PageHeader
        eyebrow="Administração"
        title="Visão geral"
        description="Acesse as principais áreas de gerenciamento do GastoZero."
      />

      <section className="px-4 md:px-10">

        <div className="mb-5">
          <h2 className="text-sm font-semibold text-ink">
            Acesso rápido
          </h2>

          <p className="text-xs text-muted mt-1">
            Selecione uma área para gerenciar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {sections.map(section => {
            const Icon = section.icon

            return (
              <button
                key={section.page}
                type="button"
                onClick={() => navigate(section.page)}
                className="
                  group card w-full p-5 md:p-6
                  text-left cursor-pointer
                  transition-all duration-200
                  hover:border-line-strong
                  hover:bg-sunken/40
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-brand
                "
              >

                <div className="flex items-start justify-between mb-6">

                  <span
                    className="
                      w-11 h-11 rounded-lg
                      bg-sunken border border-line
                      inline-flex items-center justify-center
                      text-brand
                    "
                  >
                    <Icon size={21} strokeWidth={1.8} />
                  </span>

                  <ArrowUpRight
                    size={19}
                    className="
                      text-muted
                      transition-transform duration-200
                      group-hover:text-brand
                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                    "
                  />

                </div>

                <div>
                  <h3 className="text-base font-semibold text-ink mb-1.5">
                    {section.title}
                  </h3>

                  <p className="text-sm text-muted leading-relaxed">
                    {section.description}
                  </p>
                </div>

              </button>
            )
          })}

        </div>
      </section>

    </div>
  )
}
