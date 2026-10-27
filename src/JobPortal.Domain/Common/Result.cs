namespace JobPortal.Domain.Common;

public class Result
{
    protected Result(bool isSuccess, string? error, IEnumerable<string>? errors = null)
    {
        if (isSuccess && (error != null || errors != null))
            throw new InvalidOperationException("A successful result cannot have error messages.");
        if (!isSuccess && error == null && (errors == null || !errors.Any()))
            throw new InvalidOperationException("A failure result must have an error message.");

        IsSuccess = isSuccess;
        Error = error;
        Errors = errors?.ToList() ?? (error != null ? [error] : []);
    }

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string? Error { get; }
    public IReadOnlyList<string> Errors { get; }

    public static Result Success() => new(true, null);
    public static Result Failure(string error) => new(false, error);
    public static Result Failure(IEnumerable<string> errors) => new(false, null, errors);
}

public class Result<T> : Result
{
    private readonly T? _value;

    protected Result(T? value, bool isSuccess, string? error, IEnumerable<string>? errors = null)
        : base(isSuccess, error, errors)
    {
        _value = value;
    }

    public T Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException("The value of a failure result cannot be accessed.");

    public static Result<T> Success(T value) => new(value, true, null);
    public new static Result<T> Failure(string error) => new(default, false, error);
    public new static Result<T> Failure(IEnumerable<string> errors) => new(default, false, null, errors);

    public static implicit operator Result<T>(T value) => Success(value);
}
