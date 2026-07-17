namespace HomeBudget.Server.Exceptions;

public class UserCannotHaveIncomeException : BusinessException
{
    public UserCannotHaveIncomeException() 
        : base("USER_CANNOT_HAVE_INCOME", "Usuários menores de 18 anos não podem ter receitas cadastradas no sistema.") { }
}
