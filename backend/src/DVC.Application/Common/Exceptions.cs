namespace DVC.Application.Common;

/// <summary>Requested resource does not exist → 404.</summary>
public sealed class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
    public static NotFoundException For(string entity, object key) => new($"{entity} '{key}' was not found.");
}

/// <summary>A uniqueness or state conflict → 409.</summary>
public sealed class ConflictException : Exception
{
    public ConflictException(string message) : base(message) { }
}

/// <summary>An illegal status transition → 409.</summary>
public sealed class InvalidStatusTransitionException : Exception
{
    public InvalidStatusTransitionException(string message) : base(message) { }
}

/// <summary>Caller is authenticated but not allowed to act on this resource → 403.</summary>
public sealed class ForbiddenException : Exception
{
    public ForbiddenException(string message) : base(message) { }
}
