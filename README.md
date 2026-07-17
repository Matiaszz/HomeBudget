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

**Configurações do .NET (appsettings.Development.json):**
Nas pastas [HomeBudget.AppHost](file:///E:/Projetos/csharp/HomeBudget/HomeBudget.AppHost) e [HomeBudget.Server](file:///E:/Projetos/csharp/HomeBudget/HomeBudget.Server), crie um arquivo `appsettings.Development.json` baseado no `appsettings.json` de cada respectiva pasta.

> [!IMPORTANT]
> Certifique-se de atualizar a string de conexão `DefaultConnection` no arquivo do **Server** para usar as mesmas credenciais.

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

# Tecnologias Usadas

- .NET 10
- PostgreSQL
- Entity Framework Core
- React
- Tailwind CSS

## Arquitetura

O projeto utiliza uma arquitetura híbrida, combinando princípios da Arquitetura em Camadas com conceitos da Arquitetura Hexagonal (Ports and Adapters).

A organização em camadas separa responsabilidades entre apresentação, regras de negócio e acesso a dados, enquanto a utilização de contratos (interfaces) para Services e Repositories reduz o acoplamento entre a aplicação e suas implementações concretas.

Estrutura principal:

- Controllers (Camada de Apresentação)
- Services (Ports + Implementações)
- Repositories (Ports + Implementações)
- Models
