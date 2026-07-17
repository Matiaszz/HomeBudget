using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;
using HomeBudget.Server.Data;
using HomeBudget.Server.Services;
using HomeBudget.Server.Repositories;
using HomeBudget.Server.Services.Contracts;
using HomeBudget.Server.Services.Impl;
using HomeBudget.Server.Middleware;
using HomeBudget.Server.Repositories.Impl;
using HomeBudget.Server.Repositories.Contracts;

var builder = WebApplication.CreateBuilder(args);

// Add service defaults & Aspire client integrations.
builder.AddServiceDefaults();

// Add services to the container.
builder.Services.AddProblemDetails();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var dbConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"Connection: {dbConnectionString}");

builder.Services.AddDbContext<AppDbContext>(
    opt => opt.UseNpgsql(
        dbConnectionString
    )
);

// Dependency injections
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IFamilyRepository, FamilyRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IFamilyService, FamilyService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();

// auth
var jwtKey = builder.Configuration.GetValue<string>("Jwt:Secret");
var jwtIssuer = builder.Configuration.GetValue<string>("Jwt:Issuer");
var jwtAudience = builder.Configuration.GetValue<string>("Jwt:Audience");


builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey!))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            // Coleta todas as mensagens de erro de validação do modelo
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .SelectMany(e => e.Value!.Errors.Select(x => x.ErrorMessage))
                .FirstOrDefault() ?? "Dados inválidos na requisição.";

            var response = new HomeBudget.Server.Models.ApiResponse<object>
            {
                Success = false,
                Data = null,
                ErrorCode = "VALIDATION_ERROR",
                ErrorMessage = errors
            };

            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(response);
        };
    });

var app = builder.Build();

app.MapDefaultEndpoints();

app.UseMiddleware<ExceptionHandlingMiddleware>();

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.Run();
