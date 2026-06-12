using DVC.Application.Common;
using Microsoft.AspNetCore.Mvc;
using FvValidationException = FluentValidation.ValidationException;

namespace DVC.Api.Middleware;

/// <summary>Translates known application exceptions into RFC7807 ProblemDetails responses.</summary>
public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            var (status, title, detail) = Map(ex);
            if (status >= 500)
                _logger.LogError(ex, "Unhandled exception");

            var problem = new ProblemDetails
            {
                Status = status,
                Title = title,
                Detail = detail,
                Type = $"https://httpstatuses.io/{status}"
            };

            if (ex is FvValidationException ve)
                problem.Extensions["errors"] = ve.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

            context.Response.StatusCode = status;
            context.Response.ContentType = "application/problem+json";
            await context.Response.WriteAsJsonAsync(problem);
        }
    }

    private static (int Status, string Title, string Detail) Map(Exception ex) => ex switch
    {
        FvValidationException => (StatusCodes.Status400BadRequest, "Validation failed", "One or more validation errors occurred."),
        NotFoundException => (StatusCodes.Status404NotFound, "Not found", ex.Message),
        ConflictException => (StatusCodes.Status409Conflict, "Conflict", ex.Message),
        InvalidStatusTransitionException => (StatusCodes.Status409Conflict, "Invalid status transition", ex.Message),
        ForbiddenException => (StatusCodes.Status403Forbidden, "Forbidden", ex.Message),
        _ => (StatusCodes.Status500InternalServerError, "Server error", "An unexpected error occurred.")
    };
}

public static class ExceptionHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseExceptionHandling(this IApplicationBuilder app)
        => app.UseMiddleware<ExceptionHandlingMiddleware>();
}
