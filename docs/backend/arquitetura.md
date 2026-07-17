# Objetivo

Afim de manter uma arquitetura simples para um desenvolvimento rápido, segue a estrutura e suas responsabilidades:

### Data

- Contexto do banco de dados

### Migrations

- Registro de mudanças nas tabelas

### Models

- na raiz de `Models`, terá as entidades principais, como `User` por exemplo.
- Em sua subpasta `Requests`, terá todos os requests da aplicação.
- Em sua subpasta `Responses`, terá todas as responses da aplicação.

# Repositories

Responsável pela persistência e consulta de dados. Isola todo o acesso ao banco de dados (`AppDbContext`) das demais camadas da aplicação:

- **`Contracts`**: Contém as interfaces (ex: `IUserRepository`, `IFamilyRepository`) que definem o contrato de persistência.
- **`Impl`**: Contém as classes concretas (ex: `UserRepository`, `FamilyRepository`) que implementam a comunicação direta com o Entity Framework.

### Controllers

Camada de apresentação HTTP da API. Responsável por expor os endpoints, receber as requisições HTTP, realizar validações de modelo básicas (`[Required]`, `[EmailAddress]`) e direcionar a execução para a camada de serviços:

- Delegam toda a regra de negócio para a camada de `Services`.
- Retornam os dados encapsulados de forma consistente através de um objeto padrão `ApiResponse<T>`.
- Não fazem tratamento manual de erros e exceções, deixando essa responsabilidade para o middleware global de tratamento de erros.

### Services

Camada que contém toda a lógica de negócio e regras operacionais da aplicação (ex: validações de maioridade, criptografia de senhas, cálculo de permissões de receita):

- **`Contracts`**: Contém as interfaces (ex: `IAuthService`, `IFamilyService`) que definem as operações de negócio da API.
- **`Impl`**: Contém a implementação concreta das regras de negócio, comunicando-se com a camada de `Repositories` para salvar e obter informações.
- Caso ocorra alguma violação de regra de negócio, os serviços disparam uma exceção customizada (`BusinessException`), que é tratada automaticamente pelo middleware para retornar um status HTTP correspondente.
