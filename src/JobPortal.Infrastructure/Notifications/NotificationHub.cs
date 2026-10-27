using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;

namespace JobPortal.Infrastructure.Notifications;

[Authorize]
public class NotificationHub(IApplicationDbContext context) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? Context.User?.FindFirst("sub")?.Value;

        if (Guid.TryParse(userIdStr, out var userId))
        {
            // Join user-specific group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");

            // If user is employer, also join company group
            var company = await context.Companies
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.EmployerUserId == userId);

            if (company != null)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"company-{company.Id}");
            }
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? Context.User?.FindFirst("sub")?.Value;

        if (Guid.TryParse(userIdStr, out var userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinConversation(Guid conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"conversation-{conversationId}");
    }

    public async Task LeaveConversation(Guid conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conversation-{conversationId}");
    }

    public async Task SendTypingIndicator(Guid conversationId, bool isTyping)
    {
        var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? Context.User?.FindFirst("sub")?.Value;
        var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Someone";

        if (Guid.TryParse(userIdStr, out var userId))
        {
            await Clients.OthersInGroup($"conversation-{conversationId}")
                .SendAsync("UserTyping", conversationId, userId, userName, isTyping);
        }
    }
}
