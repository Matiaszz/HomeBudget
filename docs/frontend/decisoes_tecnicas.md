# Decisões Técnicas - Frontend

Este documento descreve as decisões de arquitetura e tecnologia adotadas no frontend do **HomeBudget**, justificando as escolhas técnicas para garantir performance, resiliência, consistência visual e segurança de runtime.

---

## 1. Core Framework & Build Tooling

### React 19 & Vite 8

Optamos por utilizar a combinação de **React 19** e **Vite 8** como base para a aplicação SPA (Single Page Application):

- **Vite 8**: Garante tempos de inicialização e Hot Module Replacement (HMR) extremamente rápidos no ambiente de desenvolvimento por meio de empacotamento baseado em ES Modules nativos, além de build otimizado com Rollup.
- **React 19**: Traz suporte aprimorado para renderização concorrente, melhorias no ciclo de vida de componentes e integração nativa com novos recursos de acessibilidade e web standards.

---

## 2. Estilização & Design System

### Tailwind CSS v4 (CSS-first)

Adotamos o **Tailwind CSS v4** integrado diretamente ao Vite via `@tailwindcss/vite`.

- **Configuração Declarativa em CSS**: Ao contrário das versões anteriores que utilizavam um arquivo `tailwind.config.js` estruturado em JavaScript, o Tailwind v4 adota uma abordagem baseada em CSS. Toda a customização do tema é declarada diretamente dentro do arquivo `src/index.css` usando a diretiva `@theme inline` e propriedades personalizadas do CSS (CSS variables).
- **Espaço de Cores OKLCH**: Todas as cores do tema (como `--primary` e `--destructive`) foram definidas utilizando a notação `oklch()`. Esse espaço de cores garante uma percepção de luminosidade uniforme em telas modernas e facilita a criação de temas escuros/claros coerentes.
- **Integração de Componentes Acessíveis**: O arquivo `@import "shadcn/tailwind.css"` garante a compatibilidade com classes de animação e estados interativos complexos.

---

## 3. Comunicação HTTP e Resiliência (Fetch API Wrapper)

A comunicação com o backend é centralizada no utilitário de requisições tipadas `apiRequest<T>` localizado em [api.ts](file:///E:/Projetos/csharp/HomeBudget/frontend/src/utils/api.ts). As principais decisões de resiliência implementadas incluem:

1. **Interceptor de Sessão Expirada (401 Unauthorized)**:
   Se o token JWT expirar ou for inválido, a função `apiRequest` intercepta a resposta HTTP 401, remove o token e os metadados do usuário do `localStorage` de forma limpa e redireciona o fluxo para a tela de autenticação, evitando estados inconsistentes no cliente.
2. **Defesa contra Respostas Não-JSON**:
   Em situações onde o backend falha catastroficamente (ex: erro de proxy do servidor web, Nginx offline ou erro interno ASP.NET não tratado que devolve HTML), a requisição previne falhas catastróficas de parser JSON usando `.text()` defensivamente para capturar e reportar a mensagem em texto bruto.
3. **Mapeamento Amigável de Erros de Negócio**:
   Os códigos de erro lançados pelas validações do backend (como `EMAIL_ALREADY_EXISTS` ou `USER_CANNOT_HAVE_INCOME`) são mapeados estaticamente no dicionário `ERROR_MESSAGES` para apresentar traduções e mensagens humanizadas na UI.
4. **Timeout Integrado com AbortController**:
   Evita travamentos permanentes da interface em conexões instáveis. Toda requisição possui um limite de tempo padrão de 15 segundos antes de abortar e emitir um erro semântico de timeout.

---

## 4. Gerenciamento de Estado & Roteamento Local

### Roteamento Baseado em Histórico Nativo (Histórico Sem Dependências)

Em vez de introduzir uma biblioteca robusta de roteamento como `react-router-dom` para uma aplicação de página única focada em painéis e fluxos simples, implementamos um sistema de roteamento nativo leve em [App.tsx](file:///E:/Projetos/csharp/HomeBudget/frontend/src/App.tsx):

- **Histórico**: A navegação é efetuada alterando o estado `currentPath` e atualizando o histórico da sessão do navegador via `window.history.pushState`.
- **Sincronização**: Um listener de evento `popstate` garante que a navegação do usuário através dos botões "Voltar" e "Avançar" do navegador permaneça sincronizada com o estado visual do painel.

### Persistência de Contexto (LocalStorage)

Metadados essenciais como o token de autorização, o perfil básico do usuário logado e o identificador do grupo familiar selecionado são mantidos no `localStorage` do navegador. Isso garante que o estado da sessão seja restaurado imediatamente quando o usuário recarrega a página.

---

## 5. Precisão de Cálculos e Matemática Financeira

A manipulação de valores monetários no JavaScript é historicamente propensa a erros de precisão devido à aritmética de ponto flutuante IEEE 754 (ex: `0.1 + 0.2 === 0.30000000000000004`).

- **Valores em Centavos**: Todas as interfaces e estruturas de dados ([types/index.ts](file:///E:/Projetos/csharp/HomeBudget/frontend/src/types/index.ts)) transitam e armazenam valores monetários como números inteiros representando centavos (ex: `R$ 10,50` é representado como `1050`).
- **Apenas Exibição**: A conversão para a moeda legível ocorre exclusivamente na camada visual por meio da função `formatBRL` em [finance.ts](file:///E:/Projetos/csharp/HomeBudget/frontend/src/utils/finance.ts), dividindo o valor por `100` e utilizando a API nativa `Intl.NumberFormat("pt-BR")`.
- **Cálculo Único O(N)**: A consolidação de resumos, orçamentos individuais e distribuições por categoria é realizada no cliente através da função `recalculateSummary` que executa todas as agregações em uma única passagem pelo vetor de transações, reduzindo o custo computacional e de garbage collection.

---

## 6. Integridade de Datas e Tratamento de Fuso Horário

- **Tratamento de Strings Puras**: Quando a API retorna uma data pura no formato `YYYY-MM-DD`, evitamos a instanciação direta via `new Date(dateText)` que assume fuso horário local ou UTC de forma inconsistente.
- **Divisão Baseada em Texto**: Criamos rotinas de utilidade como `getLocalDateString` em [finance.ts](file:///E:/Projetos/csharp/HomeBudget/frontend/src/utils/finance.ts) que interpretam as frações da string diretamente pelos separadores (`-`), garantindo que o dia selecionado pelo usuário permaneça idêntico, independente do fuso horário configurado no sistema operacional do dispositivo cliente.
