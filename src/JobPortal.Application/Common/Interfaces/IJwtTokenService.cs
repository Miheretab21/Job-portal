using JobPortal.Domain.Entities;

namespace JobPortal.Application.Common.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(ApplicationUser user, IList<string> roles);
    (string rawToken, string tokenHash, DateTime expiresAtUtc) GenerateRefreshToken();
    string HashToken(string token);
}
