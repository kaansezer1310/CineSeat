using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace CineSeat.WebAPI.OpenApi;

/// <summary>
/// Üretilen OpenAPI belgesine "bearerAuth" güvenlik şemasını ekler.
/// Sonuç: Swagger UI'da sağ üstte Authorize butonu çıkar, token bir kez
/// girilince korumalı endpoint'ler elle header eklemeden test edilebilir.
/// </summary>
public class BearerSecuritySchemeTransformer : IOpenApiDocumentTransformer
{
    public Task TransformAsync(
        OpenApiDocument document,
        OpenApiDocumentTransformerContext context,
        CancellationToken cancellationToken)
    {
        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();

        document.Components.SecuritySchemes["bearerAuth"] = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Login'den dönen token'ı buraya yapıştırın ('Bearer ' öneki gerekmez)."
        };

        document.Security =
        [
            new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("bearerAuth", document)] = new List<string>()
            }
        ];

        return Task.CompletedTask;
    }
}
