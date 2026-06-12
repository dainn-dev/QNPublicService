using DVC.Application.Common;
using DVC.Domain.Common;

namespace DVC.Application.Features.Requests;

/// <summary>Allowed service-request status transitions and validation.</summary>
public static class RequestWorkflow
{
    private static readonly IReadOnlyDictionary<ServiceRequestStatus, ServiceRequestStatus[]> Allowed = new Dictionary<ServiceRequestStatus, ServiceRequestStatus[]>
    {
        [ServiceRequestStatus.Submitted] = new[] { ServiceRequestStatus.Received, ServiceRequestStatus.Cancelled, ServiceRequestStatus.Rejected },
        [ServiceRequestStatus.Received] = new[] { ServiceRequestStatus.Processing, ServiceRequestStatus.Rejected, ServiceRequestStatus.Cancelled },
        [ServiceRequestStatus.Processing] = new[] { ServiceRequestStatus.WaitingSupplement, ServiceRequestStatus.Completed, ServiceRequestStatus.Rejected, ServiceRequestStatus.Cancelled },
        [ServiceRequestStatus.WaitingSupplement] = new[] { ServiceRequestStatus.Processing, ServiceRequestStatus.Cancelled, ServiceRequestStatus.Rejected },
        [ServiceRequestStatus.Completed] = Array.Empty<ServiceRequestStatus>(),
        [ServiceRequestStatus.Rejected] = Array.Empty<ServiceRequestStatus>(),
        [ServiceRequestStatus.Cancelled] = Array.Empty<ServiceRequestStatus>()
    };

    public static void EnsureCanTransition(ServiceRequestStatus from, ServiceRequestStatus to)
    {
        if (from == to || !Allowed.TryGetValue(from, out var next) || !next.Contains(to))
            throw new InvalidStatusTransitionException($"Cannot move request from {from} to {to}.");
    }
}
