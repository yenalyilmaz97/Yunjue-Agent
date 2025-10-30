using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using KeciApp.API.Services;

namespace KeciApp.API.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AuthorizeRolesAttribute : Attribute, IAuthorizationFilter
{
    private readonly string[] _roles;

    public AuthorizeRolesAttribute(params string[] roles)
    {
        _roles = roles;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var authService = context.HttpContext.RequestServices.GetService<IAuthService>();
        var jwtService = context.HttpContext.RequestServices.GetService<IJwtService>();

        if (authService == null || jwtService == null)
        {
            context.Result = new StatusCodeResult(500);
            return;
        }

        var authorization = context.HttpContext.Request.Headers["Authorization"].FirstOrDefault();

        if (string.IsNullOrEmpty(authorization) || !authorization.StartsWith("Bearer "))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var token = authorization.Substring("Bearer ".Length);
        var principal = jwtService.ValidateToken(token);

        if (principal == null)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var userIdClaim = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        // Check if user has any of the required roles
        var hasRole = authService.HasAnyRoleAsync(userId, _roles).Result;
        if (!hasRole)
        {
            context.Result = new ForbidResult();
            return;
        }
    }
} 