Crie um protótipo completo, moderno e navegável de uma aplicação web responsiva (PWA) chamada “GastoZero”.

CONTEXTO DO PRODUTO

O GastoZero é uma aplicação de controle e conscientização financeira pessoal, focada principalmente no gerenciamento de gastos recorrentes e serviços por assinatura.

O principal diferencial é reduzir o cadastro manual. O sistema possui um catálogo pré-cadastrado de serviços e planos conhecidos, com seus preços e ciclos de cobrança. O usuário seleciona o serviço e o plano utilizado, e o sistema calcula automaticamente o impacto financeiro mensal e anual.

O sistema também permite visualizar os gastos em gráficos, acompanhar próximas cobranças e simular quanto dinheiro poderia ser economizado ao pausar ou cancelar determinadas assinaturas.

A experiência deve transmitir:
- simplicidade;
- organização;
- controle financeiro;
- economia;
- confiança;
- modernidade.

Não criar uma aparência de banco tradicional ou sistema corporativo complexo.
A interface deve parecer uma fintech moderna voltada para jovens adultos e usuários que querem entender rapidamente para onde está indo seu dinheiro.

==================================================
IDENTIDADE VISUAL
==================================================

Criar uma identidade visual clean, moderna e minimalista.

Paleta principal:

Verde principal: #16A34A
Verde escuro: #15803D
Verde claro: #DCFCE7

Vermelho de alerta: #DC2626
Vermelho claro: #FEE2E2

Fundo geral: #F8FAFC
Cards: #FFFFFF
Texto principal: #1E293B
Texto secundário: #64748B
Bordas: #E2E8F0

Utilizar o VERDE como cor principal da marca e para:
- botões principais;
- economia;
- indicadores positivos;
- valores economizados;
- estados de sucesso;
- elementos selecionados.

Utilizar VERMELHO somente para:
- gastos;
- alertas importantes;
- cancelamentos;
- cobranças próximas;
- valores negativos.

Não utilizar vermelho como cor principal da interface.

Utilizar amarelo ou laranja discretamente para alertas intermediários.

TIPOGRAFIA

Utilizar Inter ou uma fonte sans-serif moderna semelhante.

Hierarquia clara:
- títulos grandes e fortes;
- valores financeiros em destaque;
- subtítulos médios;
- textos auxiliares menores em cinza.

COMPONENTES

Utilizar:
- cards brancos;
- cantos arredondados de aproximadamente 12 a 16px;
- sombras muito sutis;
- ícones minimalistas;
- bastante espaçamento;
- gráficos simples;
- botões modernos;
- badges de status;
- tooltips quando necessário.

Evitar excesso de elementos e excesso de cores.

==================================================
NAVEGAÇÃO PRINCIPAL
==================================================

Criar uma sidebar fixa no desktop com o logotipo “GastoZero” no topo.

Itens:

Visão Geral
Minhas Assinaturas
Catálogo
Simulador
Alertas
Configurações

Adicionar ícones minimalistas ao lado dos itens.

O item selecionado deve possuir destaque em verde claro e texto/ícone verde.

Na versão mobile, transformar a navegação em uma barra inferior ou menu compacto apropriado para PWA.

Todas as telas devem possuir navegação funcional entre si.

==================================================
TELA 1 — LOGIN
==================================================

Criar uma tela de login moderna e minimalista.

Exibir o logotipo:

GastoZero

Frase:

“Tenha controle sobre seus gastos recorrentes.”

Subtexto:

“Organize suas assinaturas, acompanhe seus gastos e descubra quanto você pode economizar.”

Campos:

E-mail
Senha

Checkbox:
“Lembrar de mim”

Link:
“Esqueci minha senha”

Botão principal verde:
“Entrar”

Abaixo:

“Ainda não possui uma conta?”

Botão/link:
“Criar conta”

Adicionar uma pequena ilustração abstrata relacionada a finanças, economia ou organização, sem deixar a tela infantil.

==================================================
TELA 2 — CADASTRO
==================================================

Criar uma tela simples para criação da conta.

Campos:

Nome
E-mail
Senha
Confirmar senha

Botão:
“Criar minha conta”

Link:
“Já possui uma conta? Entrar”

Após o cadastro, direcionar para o Dashboard.

==================================================
TELA 3 — DASHBOARD / VISÃO GERAL
==================================================

Esta deve ser a principal tela do sistema.

No topo:

“Olá, Giovanna 👋”

Subtexto:

“Veja como estão seus gastos recorrentes este mês.”

No canto superior direito:
- ícone de notificações;
- avatar do usuário.

Criar quatro cards principais.

CARD 1
Título: “Gastos mensais”
Valor: “R$ 287,60”
Usar destaque visual neutro ou vermelho discreto.

CARD 2
Título: “Projeção anual”
Valor: “R$ 3.451,20”
Texto auxiliar:
“mantendo suas assinaturas atuais”

CARD 3
Título: “Assinaturas ativas”
Valor: “8”
Texto auxiliar:
“serviços ativos”

CARD 4
Título: “Economia possível”
Valor: “R$ 89,90/mês”
Usar verde.
Texto auxiliar:
“com base na simulação”

Abaixo dos cards, criar uma área de gráficos.

GRÁFICO 1:
Título: “Gastos por categoria”

Criar gráfico de rosca (donut chart).

Categorias:
Streaming
Música
Cloud
Academia
Telefonia
Software

Mostrar legenda ao lado.

GRÁFICO 2:
Título: “Projeção de gastos”

Criar gráfico de barras ou linha mostrando a projeção de gastos recorrentes ao longo do ano.

Abaixo dos gráficos criar:

“Próximas cobranças”

Exibir uma lista compacta:

Netflix
Premium
R$ 59,90
Amanhã

iCloud
200 GB
R$ 14,90
Em 3 dias

Spotify
Individual
R$ 21,90
Em 8 dias

Adicionar botão:
“Ver todos os alertas”

Criar também um pequeno card verde:

“💡 Você pode economizar R$ 1.078,80 por ano revisando suas assinaturas.”

Botão:
“Simular economia”

==================================================
TELA 4 — MINHAS ASSINATURAS
==================================================

Título:
“Minhas Assinaturas”

Subtítulo:
“Gerencie todos os seus serviços recorrentes em um só lugar.”

No topo mostrar:

8 assinaturas ativas
R$ 287,60/mês
R$ 3.451,20/ano

Adicionar botão verde:
“+ Adicionar assinatura”

Criar campo de busca:
“Buscar assinatura”

Adicionar filtros:
Todas
Streaming
Música
Cloud
Academia
Outros

Mostrar as assinaturas em cards ou tabela moderna.

Exemplos:

Netflix
Plano Premium
R$ 59,90/mês
Próxima cobrança: 29/08
Status: Ativa

Spotify
Plano Individual
R$ 21,90/mês
Próxima cobrança: 05/09
Status: Ativa

iCloud
200 GB
R$ 14,90/mês
Próxima cobrança: 31/08
Status: Ativa

Academia
Plano Mensal
R$ 99,90/mês
Próxima cobrança: 10/09
Status: Ativa

Cada assinatura deve possuir um menu de ações:

Editar
Pausar
Cancelar

Utilizar vermelho apenas na opção “Cancelar”.

==================================================
TELA 5 — CATÁLOGO
==================================================

Título:
“Catálogo de Serviços”

Subtítulo:
“Encontre seu serviço e adicione sua assinatura em poucos segundos.”

Criar barra de pesquisa grande:

“Qual serviço você utiliza?”

Adicionar categorias:

Todos
Streaming
Música
Cloud
Academia
Telefonia
Software

Mostrar cards de serviços conhecidos.

Exemplos:

Netflix
Categoria: Streaming
“A partir de R$ XX,XX”

Spotify
Categoria: Música
“A partir de R$ XX,XX”

iCloud
Categoria: Cloud
“A partir de R$ XX,XX”

YouTube Premium
Categoria: Streaming
“A partir de R$ XX,XX”

Amazon Prime
Categoria: Streaming
“A partir de R$ XX,XX”

Não inventar preços oficiais quando eles não forem fornecidos. Utilizar placeholders como “R$ XX,XX” nesses casos.

Cada card deve possuir botão:
“Ver planos”

Ao selecionar um serviço, abrir modal ou página lateral.

Exemplo:

Spotify

“Selecione seu plano”

Radio buttons:

Individual — R$ XX,XX/mês
Duo — R$ XX,XX/mês
Família — R$ XX,XX/mês

Campo:
“Data da próxima cobrança”

Botão:
“Adicionar assinatura”

Após adicionar, exibir mensagem:

“Assinatura adicionada com sucesso!”

==================================================
TELA 6 — SIMULADOR DE ECONOMIA
==================================================

Criar uma tela visualmente atraente.

Título:
“Simulador de Economia”

Subtítulo:
“Descubra quanto você poderia economizar revisando suas assinaturas.”

Mostrar todas as assinaturas do usuário com checkbox ou switch.

Texto:

“Selecione as assinaturas que você considera pausar ou cancelar.”

Exemplo:

[✓] Netflix — R$ 59,90/mês
[ ] Spotify — R$ 21,90/mês
[ ] iCloud — R$ 14,90/mês
[✓] Academia — R$ 99,90/mês

Ao selecionar ou remover itens, atualizar automaticamente os resultados.

Criar um grande card verde com:

“Você poderia economizar”

“R$ 159,80 por mês”

“R$ 1.917,60 por ano”

Abaixo mostrar uma comparação visual:

Gasto atual
R$ 287,60/mês

Após economia
R$ 127,80/mês

Representar visualmente a redução com um gráfico simples.

Adicionar uma frase:

“Isso representa uma redução de 55,6% nos seus gastos recorrentes.”

Botão:
“Revisar minhas assinaturas”

==================================================
TELA 7 — ALERTAS
==================================================

Título:
“Alertas e Próximas Cobranças”

Subtítulo:
“Não seja surpreendido por uma renovação.”

Separar os alertas por prioridade.

URGENTE

Netflix
“Renovação amanhã”
R$ 59,90
Utilizar vermelho suave.

PRÓXIMOS DIAS

iCloud
“Renovação em 3 dias”
R$ 14,90
Utilizar amarelo/laranja suave.

FUTURAS

Spotify
“Próxima cobrança em 8 dias”
R$ 21,90
Visual neutro.

Adicionar opções:

“Marcar como visto”
“Ver assinatura”

Também criar uma área:

“Preferências de alertas”

Switch:
Avisar 1 dia antes
Avisar 3 dias antes
Avisar 7 dias antes

==================================================
TELA 8 — CONFIGURAÇÕES
==================================================

Título:
“Configurações”

Criar seções:

Perfil
Nome
E-mail

Notificações
Alertas de cobrança
Alertas de renovação

Preferências
Moeda: BRL (R$)

Conta
Alterar senha
Sair da conta

Usar vermelho somente para ações destrutivas.

==================================================
INTERAÇÕES DO PROTÓTIPO
==================================================

Criar navegação funcional entre as telas.

O protótipo deve permitir demonstrar o fluxo:

Login
→ Dashboard
→ Catálogo
→ Selecionar serviço
→ Selecionar plano
→ Adicionar assinatura
→ Minhas Assinaturas
→ Dashboard atualizado

Também criar o fluxo:

Dashboard
→ Simulador de Economia
→ Selecionar assinaturas
→ Visualizar economia mensal e anual

E:

Dashboard
→ Alertas
→ Visualizar próxima cobrança
→ Abrir assinatura

Criar estados de hover nos botões e cards.

Criar feedback visual para ações realizadas.

Utilizar modais quando fizer sentido.

==================================================
RESPONSIVIDADE / PWA
==================================================

Criar o layout principal para desktop em aproximadamente 1440px.

Também criar versões responsivas das principais telas para smartphone, aproximadamente 390px de largura.

No mobile:
- cards devem ficar empilhados;
- gráficos devem ocupar a largura disponível;
- navegação deve ser adaptada;
- botões devem possuir tamanho adequado para toque;
- tabelas devem virar cards quando necessário.

A experiência mobile deve parecer um aplicativo instalado no celular.

==================================================
OBJETIVO FINAL
==================================================

O resultado deve parecer um produto real e apresentável academicamente, e não apenas um wireframe.

Priorizar:
1. clareza das informações;
2. facilidade de navegação;
3. hierarquia visual;
4. visualização rápida dos gastos;
5. destaque para economia;
6. simplicidade para cadastrar assinaturas;
7. consistência visual entre todas as telas.

O usuário deve conseguir abrir o Dashboard e entender em poucos segundos:

- quanto gasta por mês;
- quanto isso representa por ano;
- quantas assinaturas possui;
- quais cobranças estão próximas;
- em quais categorias gasta mais;
- quanto poderia economizar.

Não adicionar funcionalidades financeiras que não façam parte da proposta, como conta bancária, cartão de crédito, investimentos, empréstimos ou transferências.

O foco do GastoZero é exclusivamente organização, monitoramento, análise e simulação de gastos recorrentes e assinaturas.