using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace HomeBudget.Server.Models.Responses;

/// <summary>
/// Modelo genérico para representar resultados paginados.
/// </summary>
public record PagedResult<T>
{
    /// <summary>
    /// Lista de itens da página atual.
    /// </summary>
    [JsonPropertyName("items")]
    public List<T> Items { get; init; } = [];

    /// <summary>
    /// Total de registros existentes na base de dados.
    /// </summary>
    [JsonPropertyName("totalCount")]
    public int TotalCount { get; init; }

    /// <summary>
    /// Número da página atual (iniciando em 1).
    /// </summary>
    [JsonPropertyName("page")]
    public int Page { get; init; }

    /// <summary>
    /// Quantidade de registros por página.
    /// </summary>
    [JsonPropertyName("pageSize")]
    public int PageSize { get; init; }

    /// <summary>
    /// Quantidade total de páginas disponíveis.
    /// ceil: arredonda um número para cima, em direção ao próximo número inteiro maior
    /// </summary>
    [JsonPropertyName("totalPages")]
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / (PageSize > 0 ? PageSize : 1));
}
