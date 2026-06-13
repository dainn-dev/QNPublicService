using DVC.Domain.Common;

namespace DVC.Application.Features.Engagement;

/// <summary>Push to an explicit set of users.</summary>
public sealed record PushNotificationRequest(
    IReadOnlyList<Guid> UserIds, string Title, string Message, NotificationType Type = NotificationType.System);

/// <summary>Broadcast to a resolved audience (all citizens / a ward / officers).</summary>
public sealed record BroadcastNotificationRequest(
    NotificationAudience Audience, int? WardCode, string? Department, string Title, string Message);

/// <summary>Urgent broadcast to all citizens (type = emergency).</summary>
public sealed record EmergencyNotificationRequest(string Title, string Message);

/// <summary>A sent campaign as shown in the admin history.</summary>
public sealed record NotificationCampaignDto(
    Guid Id, NotificationCampaignType Type, string Audience, int? WardCode, string? Department,
    string Title, string Message, int RecipientCount, Guid SentByUserId, DateTime SentAt);
