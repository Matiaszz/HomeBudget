# Decisões Gerais do Sistema

Este documento descreve as decisões gerais de arquitetura e design de produto adotadas no **HomeBudget** com base nos requisitos do Desafio Técnico. Ele detalha os motivos pelos quais implementamos recursos adicionais, como o sistema de autenticação simples e o conceito de grupos familiares, alinhando-os à proposta do desafio.

---

## 1. Autenticação Simples & Isolamento de Dados (Multi-tenancy)

**Decisão**: Implementar um sistema de autenticação JWT (JSON Web Token) contendo fluxos de Registro de Usuários e Login.

### Justificativa:

- **Isolamento e Segurança de Dados**: O desafio exige que a aplicação persista os dados após ser fechada. Em um cenário real de uso residencial, múltiplos usuários podem utilizar o sistema. Sem autenticação, todos os dados ficariam expostos de forma global no banco de dados para qualquer visitante. A autenticação garante que o **Usuário A** não veja nem altere as pessoas (familiares) ou transações financeiras cadastradas pelo **Usuário B**.

---

## 2. Grupos Familiares (O Contexto de "Residência")

**Decisão**: Agrupar as pessoas e transações sob uma entidade intermediária chamada `Family` (Família).

### Justificativa:

- **Aderência ao Negócio Residencial**: O objetivo do desafio é construir um "sistema de controle de gastos _residenciais_". No mundo real, gastos residenciais ocorrem dentro de um contexto doméstico comum compartilhado por moradores da mesma casa (uma família).
- **Organização dos Dados**: Em vez de tratar pessoas e transações como entidades planas globais associadas diretamente a um usuário genérico, o sistema permite que o usuário crie ou faça parte de uma ou mais "Famílias" (ex: "Casa Principal", "Casa de Praia", "República").
- **Alternância de Contexto**: O usuário autenticado pode alternar facilmente entre suas famílias no painel de controle. Ao selecionar uma família ativa, toda a listagem de pessoas, transações e totais exibidos são filtrados automaticamente por essa residência. Isso evita misturar despesas de locais diferentes.

---

## 3. Resolução de Regras de Negócio Específicas

### Cadastro de Pessoas (Familiares)

- O identificador (`Id`) é um GUID gerado automaticamente no backend no momento da inserção.
- A deleção de um familiar remove de forma automática (Cascade Delete) todas as suas transações vinculadas, prevenindo que transações órfãs permaneçam no banco de dados e distorçam os totais consolidados. Isso foi mapeado e implementado na camada do banco de dados relacional via Entity Framework Core.

### Cadastro de Transações (Ledger)

- O identificador (`Id`) é um GUID único gerado automaticamente.
- O valor da transação está atrelado a um membro da família ativo (`FamiliarId`), garantindo a integridade referencial.
- **Regra de Menor de Idade**: Caso a pessoa selecionada tenha menos de 18 anos (calculado dinamicamente a partir da data de nascimento inserida), o sistema impede o lançamento de receitas, permitindo **apenas despesas**.
  - **Frontend**: A interface do usuário esconde e bloqueia reativamente o seletor do tipo de transação (Receita) assim que um familiar menor de idade é escolhido no formulário de inclusão.
  - **Backend**: A camada de serviço do servidor ([TransactionService.cs](file:///E:/Projetos/csharp/HomeBudget/HomeBudget.Server/Services/Impl/TransactionService.cs)) realiza a verificação de idade e lança uma exceção de negócio (`BusinessException` com o código `USER_CANNOT_HAVE_INCOME`) caso uma requisição adulterada tente enviar uma receita para um menor de idade.

### Consulta de Totais

- Conforme especificado, a listagem de pessoas apresenta detalhadamente o total acumulado de receitas, despesas e o saldo individual de cada um.
- A seção de rodapé da página consolida os valores totais gerais da família selecionada (Receita total de todas as pessoas, Despesa total e o Saldo Líquido final da residência), fornecendo uma visão clara da saúde financeira do lar.

---

## 4. Precisão Financeira (Estratégia de Centavos)

**Decisão**: Armazenar e computar todos os valores monetários como números inteiros representando centavos (ex: `100` = R$ 1,00; `1050` = R$ 10,50).

### Justificativa:

- **Prevenção de Erros de Arredondamento**: Operações com números decimais (`float` ou `double`) em bancos de dados e no runtime do JavaScript são suscetíveis a erros de imprecisão matemática. Ao adotar centavos (representados por tipos `long`/`int` no backend e `number` no frontend), eliminamos esses desvios. O tratamento de conversão decimal ocorre exclusivamente no momento de renderização visual para o usuário.
