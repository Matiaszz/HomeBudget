using System.Net;

namespace HomeBudget.Server.Exceptions;

/// <summary>
/// Exceção de regra de negócio customizada que mapeia um código de erro interno e um código de status HTTP correspondente.
/// </summary>
public class BusinessException : Exception
{
    /// <summary>
    /// Código de erro interno para identificação de regras quebradas no frontend.
    /// </summary>
    public string ErrorCode { get; }

    /// <summary>
    /// Código de status HTTP a ser retornado para o cliente.
    /// </summary>
    public HttpStatusCode StatusCode { get; }

    /// <summary>
    /// Inicializa uma nova instância da classe <see cref="BusinessException"/>.
    /// </summary>
    /// <param name="errorCode">Código de erro comercial.</param>
    /// <param name="message">Mensagem descritiva da exceção.</param>
    /// <param name="statusCode">Status HTTP associado à resposta (padrão BadRequest).</param>
    public BusinessException(string errorCode, string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest)
        : base(message)
    {
        ErrorCode = errorCode;
        StatusCode = statusCode;
    }
}
