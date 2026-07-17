namespace HomeBudget.Server.Exceptions;

public class EmailAlreadyExistsException : BusinessException
{
    public EmailAlreadyExistsException() 
        : base("EMAIL_ALREADY_EXISTS", "Este e-mail já está em uso por outra conta.") { }
}
