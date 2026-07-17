namespace HomeBudget.Server.Exceptions;

public class UserUnderageException : BusinessException
{
    public UserUnderageException()
        : base("USER_UNDERAGE", "Você deve ter pelo menos 18 anos de idade para criar uma conta.") { }
}
