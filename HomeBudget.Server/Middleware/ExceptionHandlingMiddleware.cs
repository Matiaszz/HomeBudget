using System.Net;
using System.Text.Json;
using HomeBudget.Server.Exceptions;
using HomeBudget.Server.Models;

namespace HomeBudget.Server.Middleware;

/// <summary>
/// Middleware global para captura e tratamento centralizado de exceções na API.
/// </summary>
public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    private readonly RequestDelegate _next = next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger = logger;

    /// <summary>
    /// Invoca a execução da requisição capturando qualquer exceção disparada no pipeline.
    /// </summary>
    /// <param name="context">O contexto HTTP da requisição atual.</param>
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (BusinessException ex)
        {
            _logger.LogWarning(ex, "Business exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex.StatusCode, ex.ErrorCode, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred." + ex);
            await HandleExceptionAsync(context, HttpStatusCode.InternalServerError, "UNKNOWN_ERROR", "Ocorreu um erro inesperado. Tente novamente mais tarde.");
        }
    }

    /// <summary>
    /// Formata e envia uma resposta JSON padronizada (ApiResponse.Fail) para o cliente.
    /// </summary>
    private static async Task HandleExceptionAsync(HttpContext context, HttpStatusCode statusCode, string errorCode, string message)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var apiResponse = ApiResponse.Fail(errorCode, message);
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        var json = JsonSerializer.Serialize(apiResponse, jsonOptions);

        await context.Response.WriteAsync(json);
    }
}
