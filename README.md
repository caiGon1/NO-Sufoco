# No Sufoco 💸

O **No Sufoco** é uma aplicação web de gestão financeira pessoal e monitoramento de investimentos projetada para ajudar os usuários a organizarem suas finanças, preverem gastos futuros e acompanharem seus ativos de mercado em um único lugar de forma simples e visual.

---

## 🚀 Tecnologias Utilizadas

A aplicação foi construída utilizando tecnologias modernas do ecossistema JavaScript:

- **React 19** – Biblioteca para construção de interfaces de usuário dinâmicas.
- **Vite 8** – Ferramenta de build extremamente rápida para o desenvolvimento frontend.
- **Material UI (MUI) v9** – Biblioteca de componentes prontos para garantir uma interface profissional e consistente.
- **MUI X-Charts** – Renderização de gráficos interativos para análise de dados.
- **Tailwind CSS v4** – Framework CSS utilitário para estilização rápida, responsiva e moderna.
- **React Router Dom v7** – Gerenciamento e navegação de rotas de forma declarativa.
- **Axios** – Cliente HTTP para integração com a API backend.

---

## 📦 Estrutura de Páginas e Rotas

A navegação do sistema é gerenciada no arquivo principal `App.jsx` e conta com as seguintes rotas:

1. **` / ` (Login):** Tela inicial de autenticação do usuário.
2. **`/cadastro` (Cadastro):** Tela de criação de conta para novos usuários.
3. **`/dashboard` (Dashboard):** O painel principal de controle financeiro.
4. **`/acoes` (Ações / Meus Ativos):** Área de gestão e monitoramento de investimentos.

---

## 🛠 Funcionalidades Principais

### 1. Painel de Controle Financeiro (`Dashboard.jsx`)
O dashboard oferece uma visão analítica profunda sobre a saúde financeira do usuário:
- **Importação Automatizada de Extratos:** Permite o upload de arquivos de extrato bancário em formato **PDF** (com suporte opcional a PDFs protegidos por senha). O extrato é processado por Inteligência Artificial no backend para popular os gráficos instantaneamente.
- **Projeção de Parcelas Futuras:** Algoritmo integrado no frontend que analisa transações parceladas no cartão de crédito e projeta automaticamente os gastos futuros mês a mês, permitindo ao usuário antecipar seu endividamento em meses subsequentes.
- **Visualização por Gráficos Interativos:**
  - **Evolução Financeira:** Um gráfico de linha (`LineChart`) mostrando o saldo do período histórico.
  - **Gastos por Categoria:** Um gráfico de pizza (`PieChart`) que distribui as despesas por categorias (ex: Alimentação, Transporte) com as respectivas porcentagens automáticas.
  - **Comparativo Mensal:** Um gráfico de barras (`BarChart`) comparando as Entradas (Créditos) versus Saídas (Débitos).
- **Interface Responsiva Avançada:** Layout duplo adaptável. Em dispositivos móveis (Mobile), o sistema implementa uma barra de navegação inferior estilo aba (`Tabs`) para alternar fluidamente entre Transações, Estatísticas e Ações.
- **Gerenciamento de Sessão:** Botão de **Sair (Logout)** que limpa as credenciais do `localStorage` e redireciona de forma segura para a tela inicial.

### 2. Monitoramento de Investimentos (`Acoes.jsx`)
Uma tela dedicada ao gerenciamento de ativos do mercado financeiro e configuração de alertas inteligentes:
- **Monitoramento Global Dinâmico:** Um interruptor (`Switch`) principal que habilita ou desabilita o envio diário de resumos e alertas gerados por inteligência artificial diretamente para o e-mail do usuário.
- **Favoritos e Ativos Customizados:** Lista de ações salvas em carteira. O usuário pode gerenciar individualmente quais ações deseja ativar/desativar para análise diária.
- **Exploração e Inclusão de Ativos:** Integração com o componente `SeletorAtivos` dentro de um modal customizado (`ModalPersonalizado`), permitindo buscar e adicionar novos tickers (codes de ações) à sua carteira de forma intuitiva.
- **Navegação Fluida:** Botão de retorno rápido inserido diretamente no cabeçalho para voltar ao Dashboard sem perda de estado.
- **Notificações em Tempo Real:** Sistema de feedbacks visuais por meio de `Snackbar` e `Alert` do Material UI que informam o sucesso ou falha nas operações com o servidor.

---

