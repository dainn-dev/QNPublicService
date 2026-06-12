using DVC.Domain.Common;

namespace DVC.Application.Features.Feedback;

public sealed record FeedbackCategoryDto(Guid Id, string Code, string Name, bool IsActive);

public sealed record FeedbackAttachmentDto(Guid Id, string Url, string? FileName, string? ContentType);
public sealed record FeedbackCommentDto(Guid Id, Guid AuthorId, string Content, bool IsInternal, DateTime CreatedAt);
public sealed record FeedbackHistoryDto(FeedbackStatus? FromStatus, FeedbackStatus ToStatus, Guid? ChangedById, string? Note, DateTime ChangedAt);

public sealed record FeedbackReportDto(
    Guid Id, string Code, Guid CategoryId, Guid CitizenId, string Title, string Description,
    string? Address, decimal? Latitude, decimal? Longitude, int? ProvinceCode, int? WardCode,
    FeedbackStatus Status, FeedbackPriority Priority, Guid? AssignedOfficerId,
    DateTime SubmittedAt, DateTime? DueAt, DateTime? ResolvedAt, DateTime? ClosedAt,
    IReadOnlyList<FeedbackAttachmentDto> Attachments,
    IReadOnlyList<FeedbackCommentDto> Comments,
    IReadOnlyList<FeedbackHistoryDto> History);

public sealed record SubmitFeedbackDto(
    Guid CategoryId, string Title, string Description,
    string? Address, decimal? Latitude, decimal? Longitude, int? ProvinceCode, int? WardCode,
    FeedbackPriority? Priority);

public sealed record AddFeedbackAttachmentDto(string Url, string? FileName, string? ContentType);
public sealed record AddFeedbackCommentDto(string Content, bool IsInternal);
public sealed record AssignFeedbackDto(Guid OfficerId);
public sealed record ChangeFeedbackStatusDto(FeedbackStatus Status, string? Note);
