using System.Net;

namespace HomeBudget.Server.Exceptions;

public class InvalidCredentialsException : BusinessException
{
    public InvalidCredentialsException() 
        : base("INVALID_CREDENTIALS", "E-mail ou senha incorretos.", HttpStatusCode.Unauthorized) { }
}
