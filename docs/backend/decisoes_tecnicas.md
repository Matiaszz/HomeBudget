# ApiResponse`<T>`

Todas as respostas da API seguem um contrato padronizado através da classe genérica `ApiResponse<T>`:

- **Estrutura**: Contém os campos `Success` (boolean), `Data` (objeto de retorno de tipo `T`), `ErrorCode` (código identificador de erro) e `ErrorMessage` (mensagem detalhada do erro).
- **Vantagem**: Simplifica drasticamente o consumo no frontend, pois a estrutura de resposta é sempre uniforme e previsível, simplificando o fluxo de tratamento de sucesso e erros no cliente (como na função centralizada `apiRequest`).

### Middleware Global de Exceções (`ExceptionHandlingMiddleware`)

Adotamos o padrão de tratamento global de exceções para desacoplar e limpar o código dos controllers:

- **Funcionamento**: Qualquer erro ou validação de regra de negócio não-satisfeita nas camadas inferiores (Services/Repositories) dispara uma exceção especializada herdada de `BusinessException`.
- **Vantagem**: Remove a necessidade de blocos `try-catch` repetitivos ou checagens condicionais complexas nos controllers. O middleware captura os erros automaticamente, formata no padrão `ApiResponse<T>` e devolve o status HTTP semântico (400 Bad Request, 401 Unauthorized, etc.).

### Mapeamento com `[JsonPropertyName]`

Optamos por mapear as convenções de escrita dos payloads via anotações C#:

- **Funcionamento**: A propriedade em português vinda do frontend (ex: `dataNascimento`) é mapeada na propriedade C# (ex: `BirthDate`) usando o atributo `[JsonPropertyName("dataNascimento")]`.
- **Vantagem**: Permite que o frontend continue consumindo e enviando chaves em português (preservando o design original da UI), enquanto o backend mantém convenções em inglês alinhadas com as entidades do banco de dados de maneira totalmente transparente e sem atrito.
