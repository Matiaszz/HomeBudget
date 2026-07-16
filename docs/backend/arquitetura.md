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

- Em seu root, terá um contrato (interface) CRUD padrão, afim de evitar repetição de código.
- Em sua subpasta `Entities`, terá o contrato do repositório daquela entidade.
- Dentro de `Entities`, terá uma pasta `Impl`, que visa implementar as operações do contrato do repositório de uma entidade.
