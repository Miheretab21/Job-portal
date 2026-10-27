namespace JobPortal.Domain.Common;

public abstract class BaseEntity<TId> : IAuditableEntity
{
    public TId Id { get; set; } = default!;
    public DateTime CreatedAtUtc { get; set; } = default;
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
    public string? UpdatedBy { get; set; }
}

public abstract class BaseEntity : BaseEntity<Guid>
{
    protected BaseEntity()
    {
        Id = Guid.CreateVersion7();
    }
}
