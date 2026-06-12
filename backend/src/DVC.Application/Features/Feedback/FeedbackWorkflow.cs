using DVC.Application.Common;
using DVC.Domain.Common;

namespace DVC.Application.Features.Feedback;

/// <summary>Allowed feedback status transitions and validation.</summary>
public static class FeedbackWorkflow
{
    private static readonly IReadOnlyDictionary<FeedbackStatus, FeedbackStatus[]> Allowed = new Dictionary<FeedbackStatus, FeedbackStatus[]>
    {
        [FeedbackStatus.Submitted] = new[] { FeedbackStatus.Received, FeedbackStatus.Assigned, FeedbackStatus.Rejected },
        [FeedbackStatus.Received] = new[] { FeedbackStatus.Assigned, FeedbackStatus.Processing, FeedbackStatus.Rejected },
        [FeedbackStatus.Assigned] = new[] { FeedbackStatus.Processing, FeedbackStatus.Rejected },
        [FeedbackStatus.Processing] = new[] { FeedbackStatus.Resolved, FeedbackStatus.Rejected },
        [FeedbackStatus.Resolved] = new[] { FeedbackStatus.Closed },
        [FeedbackStatus.Rejected] = new[] { FeedbackStatus.Closed },
        [FeedbackStatus.Closed] = Array.Empty<FeedbackStatus>()
    };

    public static void EnsureCanTransition(FeedbackStatus from, FeedbackStatus to)
    {
        if (from == to || !Allowed.TryGetValue(from, out var next) || !next.Contains(to))
            throw new InvalidStatusTransitionException($"Cannot move feedback from {from} to {to}.");
    }
}
