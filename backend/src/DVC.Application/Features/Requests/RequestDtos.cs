using DVC.Domain.Common;

namespace DVC.Application.Features.Requests;

public sealed record RequestDocumentDto(Guid Id, string Url, string? DocumentType, string? FileName, bool IsSupplement);
public sealed record RequestHistoryDto(ServiceRequestStatus? FromStatus, ServiceRequestStatus ToStatus, Guid? ChangedById, string? Note, DateTime ChangedAt);

public sealed record ServiceRequestDto(
    Guid Id, string Code, Guid PublicServiceId, Guid CitizenId, Guid? ServicePointId, Guid? AssignedOfficerId,
    ServiceRequestStatus Status, string? Note, DateTime SubmittedAt, DateTime? DueAt, DateTime? CompletedAt,
    IReadOnlyList<RequestDocumentDto> Documents, IReadOnlyList<RequestHistoryDto> History);

public sealed record SubmitRequestDto(Guid PublicServiceId, Guid? ServicePointId, string? Note);
public sealed record AddRequestDocumentDto(string Url, string? DocumentType, string? FileName, bool IsSupplement);
public sealed record AssignRequestDto(Guid OfficerId);
public sealed record ChangeRequestStatusDto(ServiceRequestStatus Status, string? Note);
