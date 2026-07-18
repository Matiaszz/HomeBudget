# Arquitetura - Frontend

Este documento descreve a organização de pastas, responsabilidades e fluxo de dados no frontend do **HomeBudget**, garantindo um desenvolvimento consistente, manutenível e limpo.

---

## 1. Estrutura de Diretórios e Responsabilidades

O código-fonte do frontend está concentrado dentro do diretório `/src` e é estruturado da seguinte forma:

```
src/
├── components/          # Componentes visuais da aplicação
│   ├── auth/            # Telas, modais e helpers de Autenticação
│   ├── dashboard/       # Painéis de controle, gerência de transações e relatórios
│   ├── family/          # Gerenciamento de grupo familiar e familiares
│   └── ui/              # Componentes base e primitivos de design (design system)
├── lib/                 # Configurações de bibliotecas de terceiros (ex: class-merging)
├── types/               # Tipos TypeScript compartilhados e DTOs de comunicação
├── utils/               # Funções auxiliares puras de lógica (API, finanças, datas)
├── App.tsx              # Componente central que orquestra estados e roteamento local
├── index.css            # Folha de estilo global e definições do Tailwind v4
└── main.tsx             # Ponto de entrada do React
```

---

## 2. Descrição das Camadas

### Componentes Base (`src/components/ui/`)
Representa o nível mais elementar do design system. Implementa componentes primitivos reutilizáveis inspirados no **shadcn/ui** (como [button.tsx](file:///E:/Projetos/csharp/HomeBudget/frontend/src/components/ui/button.tsx) e [card.tsx](file:///E:/Projetos/csharp/HomeBudget/frontend/src/components/ui/card.tsx)).
- **Características**: São agnósticos às regras de negócio e focados em acessibilidade, suporte a estados CSS interativos e estilizações modulares via CVA (`class-variance-authority`).

### Componentes de Domínio (`src/components/auth/`, `/dashboard/`, `/family/`)
Agrupam os blocos visuais e lógicas específicas de cada fluxo da aplicação:
- **`auth`**: Contém o formulário de login ([LoginView.tsx](file:///E:/Projetos/csharp/HomeBudget/frontend/src/components/auth/LoginView.tsx)), o registro de contas ([RegisterView.tsx](file:///E:/Projetos/csharp/HomeBudget/frontend/src/components/auth/RegisterView.tsx)) e componentes de narrativa visual que guiam o onboarding.
- **`dashboard`**: Engloba a listagem e o gerenciamento de lançamentos financeiros ([TransactionsManager.tsx](file:///E:/Projetos/csharp/HomeBudget/frontend/src/components/dashboard/TransactionsManager.tsx)) e os relatórios interativos e consolidados ([FamiliarReports.tsx](file:///E:/Projetos/csharp/HomeBudget/frontend/src/components/dashboard/FamiliarReports.tsx)).
- **`family`**: Responsável pelas telas de seleção de grupos familiares e cadastro de membros ([FamiliarsManager.tsx](file:///E:/Projetos/csharp/HomeBudget/frontend/src/components/family/FamiliarsManager.tsx)).

### Tipagem Estática (`src/types/index.ts`)
Centraliza todas as interfaces e DTOs que mapeiam o domínio de negócios.
- **Vantagem**: Garante a integridade e autocomplemento de dados em todo o codebase, minimizando erros em runtime causados por propriedades nulas ou formatos inesperados provenientes do backend.

### Utilitários (`src/utils/`)
Isolam lógicas puras de processamento e requisições HTTP:
- **`api.ts`**: Cliente fetch customizado responsável pela segurança de requisições, injeção de tokens de autorização e tratamento de exceções.
- **`finance.ts`**: Lógicas matemáticas de consolidação financeira e formatação localizada de moedas e fuso-horários.

---

## 3. Fluxo de Dados e Ciclo de Vida do Estado

O componente principal [App.tsx](file:///E:/Projetos/csharp/HomeBudget/frontend/src/App.tsx) funciona como o orquestrador central do estado da aplicação:

```mermaid
graph TD
    A[App.tsx - Estado Central] -->|1. JWT Token| B(Autenticação e Perfil de Usuário)
    A -->|2. IDs das Famílias| C(Famílias do Usuário)
    A -->|3. ID Selecionado| D(Família Ativa)
    
    D -->|Gatilhos reativos baseados em useEffect| E[Carregar Familiares]
    D -->|Gatilhos reativos baseados em useEffect| F[Carregar Transações]
    D -->|Gatilhos reativos baseados em useEffect| G[Carregar Resumo Orçamentário]
    
    F -->|Recálculo O(N) no cliente se adicionado| H[recalculateSummary]
    H -->|Atualização rápida da UI| A
```

1. **Autenticação**: O ciclo de vida inicia validando o JWT no `localStorage`. Caso não exista, o usuário é direcionado para o fluxo `/auth`.
2. **Carregamento Reativo**: Assim que o perfil do usuário é inicializado, as famílias vinculadas são obtidas. Ao selecionar ou mudar a família ativa, efeitos colaterais (`useEffect`) disparam requisições simultâneas para carregar os familiares correspondentes, as transações e o resumo financeiro consolidado.
3. **Atualização Otimizada**: Modificações locais (como a inserção rápida de transações) recalculam o painel de forma otimizada antes da sincronização total, proporcionando uma experiência de uso fluida e sem atrasos visuais.
