namespace HomeBudget.Server.Models;

public record ApiResponse<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? ErrorCode { get; init; }
    public string? ErrorMessage { get; init; }

    public static ApiResponse<T> Ok(T data) => new() { Success = true, Data = data };
    public static ApiResponse<T> Fail(string errorCode, string errorMessage) => new() { Success = false, ErrorCode = errorCode, ErrorMessage = errorMessage };
}

public record ApiResponse : ApiResponse<object>
{
    public static ApiResponse Ok() => new() { Success = true };
    public static new ApiResponse Fail(string errorCode, string errorMessage)
    {
        return new() { Success = false, ErrorCode = errorCode, ErrorMessage = errorMessage };
    }
}
