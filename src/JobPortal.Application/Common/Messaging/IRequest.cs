namespace JobPortal.Application.Common.Messaging;

public interface IRequest<out TResponse>
{
}

public interface IRequest : IRequest<Unit>
{
}

public readonly struct Unit
{
    public static readonly Unit Value = new();
}
