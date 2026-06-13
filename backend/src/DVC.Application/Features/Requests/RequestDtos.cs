using DVC.Domain.Common;

namespace DVC.Application.Features.Requests;

public sealed record RequestDocumentDto(Guid Id, string Url, string? DocumentType, string? FileName, bool IsSupplement);
public sealed record RequestCommentDto(Guid Id, Guid AuthorId, string AuthorName, string Content, bool IsInternal, DateTime CreatedAt);
public sealed record RequestHistoryDto(ServiceRequestStatus? FromStatus, ServiceRequestStatus ToStatus, Guid? ChangedById, string ChangedByName, string? Note, DateTime ChangedAt);

public sealed record ServiceRequestDto(
    Guid Id, string Code, Guid PublicServiceId, Guid CitizenId, string CitizenName, string? CitizenPhone, Guid? ServicePointId, Guid? AssignedOfficerId,
    ServiceRequestStatus Status, string? Note, DateTime SubmittedAt, DateTime? DueAt, DateTime? CompletedAt,
    IReadOnlyList<RequestDocumentDto> Documents, IReadOnlyList<RequestCommentDto> Comments, IReadOnlyList<RequestHistoryDto> History);

public sealed record SubmitRequestDto(Guid PublicServiceId, Guid? ServicePointId, string? Note);
public sealed record AddRequestDocumentDto(string Url, string? DocumentType, string? FileName, bool IsSupplement);
public sealed record AddRequestCommentDto(string Content, bool IsInternal);
public sealed record AssignRequestDto(Guid OfficerId);
public sealed record ChangeRequestStatusDto(ServiceRequestStatus Status, string? Note);
