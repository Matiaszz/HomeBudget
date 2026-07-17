using System;
using System.Net;
using System.Text.Json;
using HomeBudget.Server.Exceptions;
using HomeBudget.Server.Models;

namespace HomeBudget.Server.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    private readonly RequestDelegate _next = next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger = logger;
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
            _logger.LogError(ex, "An unhandled exception occurred.");
            await HandleExceptionAsync(context, HttpStatusCode.InternalServerError, "UNKNOWN_ERROR", "Ocorreu um erro inesperado. Tente novamente mais tarde.");
        }
    }

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
