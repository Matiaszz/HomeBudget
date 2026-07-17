# HomeBudget - Como Rodar

## 🛠️ Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- [PostgreSQL](https://www.postgresql.org/download/)
- Workload do .NET Aspire. Instale usando o comando no terminal:
  ```bash
  dotnet workload install aspire
  ```

---

## ⚙️ Configuração do Ambiente

1. **Banco de Dados (.env):**
   Crie um arquivo `.env` na raiz do projeto baseado no `.env-example` e preencha com as informações do seu banco de dados local:

   ```env
   DB_NAME=homeBudgetDB
   DB_USER=postgres
   DB_PASSWORD=postgres
   ```

2. **Configurações do .NET (appsettings.Development.json):**
   Nas pastas [HomeBudget.AppHost](file:///E:/Projetos/csharp/HomeBudget/HomeBudget.AppHost) e [HomeBudget.Server](file:///E:/Projetos/csharp/HomeBudget/HomeBudget.Server), crie um arquivo `appsettings.Development.json` baseado no `appsettings.json` de cada respectiva pasta.
   > [!IMPORTANT]
   > Certifique-se de atualizar a string de conexão `DefaultConnection` no arquivo do **Server** para usar o mesmo nome de banco, usuário e senha que você definiu no `.env` (por padrão, `Database=homeBudgetDB`).

---

## 🚀 Como Executar o Projeto

### 1. Instalar as Dependências do Frontend

Abra o terminal na pasta [frontend](file:///E:/Projetos/csharp/HomeBudget/frontend) e execute:

```bash
cd frontend
npm install
```

### 2. Executar a Aplicação (via .NET Aspire)

Para iniciar tanto a API backend quanto o frontend orquestrados pelo Aspire, execute o comando a partir da raiz do projeto:

```bash
dotnet run --project HomeBudget.AppHost
```

Após o comando iniciar, você poderá acessar o **Painel do .NET Aspire** através do link gerado no terminal para monitorar os logs e acessar o frontend e a API.
