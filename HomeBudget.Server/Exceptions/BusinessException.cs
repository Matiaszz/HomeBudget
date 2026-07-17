using System;
using System.Net;

namespace HomeBudget.Server.Exceptions;

public class BusinessException : Exception
{
    public string ErrorCode { get; }
    public HttpStatusCode StatusCode { get; }

    public BusinessException(string errorCode, string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest) 
        : base(message)
    {
        ErrorCode = errorCode;
        StatusCode = statusCode;
    }
}
