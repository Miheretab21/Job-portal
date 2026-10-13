using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestAuthController : ControllerBase
{
    [Authorize]
    [HttpGet]
    public IActionResult GetProtectedData()
    {
        return Ok(new
        {
            message = "You have accessed a protected endpoint!",
            userId = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier
            )?.Value,
            email = User.FindFirst(
                System.Security.Claims.ClaimTypes.Email
            )?.Value
        });
    }
}
