using Microsoft.Extensions.DependencyInjection;

namespace JobPortal.Application.Common.Messaging;

public class Dispatcher(IServiceProvider serviceProvider) : ISender
{
    public async Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var requestType = request.GetType();
        var handlerType = typeof(IRequestHandler<,>).MakeGenericType(requestType, typeof(TResponse));
        var handler = serviceProvider.GetService(handlerType)
            ?? throw new InvalidOperationException($"No handler registered for request type '{requestType.FullName}'");

        var behaviors = serviceProvider.GetServices(typeof(IPipelineBehavior<,>).MakeGenericType(requestType, typeof(TResponse)))
            .Cast<dynamic>()
            .Reverse()
            .ToList();

        RequestHandlerDelegate<TResponse> handlerDelegate = () =>
        {
            var method = handlerType.GetMethod(nameof(IRequestHandler<IRequest<TResponse>, TResponse>.Handle))!;
            var result = method.Invoke(handler, [request, cancellationToken]);
            return (Task<TResponse>)result!;
        };

        foreach (var behavior in behaviors)
        {
            var currentNext = handlerDelegate;
            var currentBehavior = behavior;
            handlerDelegate = () => currentBehavior.Handle((dynamic)request, currentNext, cancellationToken);
        }

        return await handlerDelegate();
    }
}
