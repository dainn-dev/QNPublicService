using DVC.Application.Abstractions;
using DVC.Application.Abstractions.Identity;
using DVC.Application.Common;
using DVC.Domain.Common;
using DVC.Domain.Engagement;
using Microsoft.EntityFrameworkCore;

namespace DVC.Application.Features.Engagement;

public sealed record RateDto(int Score, string? Comment);
public sealed record RatingDto(Guid Id, Guid UserId, int Score, string? Comment, DateTime CreatedAt);
public sealed record RatingSummaryDto(double Average, int Count, IReadOnlyList<RatingDto> Ratings);

public sealed class RatingService
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUser _user;

    public RatingService(IAppDbContext db, ICurrentUser user)
    {
        _db = db;
        _user = user;
    }

    public async Task<RatingSummaryDto> GetServicePointRatingsAsync(Guid servicePointId, CancellationToken ct = default)
    {
        var ratings = await _db.ServicePointRatings
            .Where(r => r.ServicePointId == servicePointId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new RatingDto(r.Id, r.UserId, r.Score, r.Comment, r.CreatedAt))
            .ToListAsync(ct);
        var avg = ratings.Count == 0 ? 0 : Math.Round(ratings.Average(r => r.Score), 2);
        return new RatingSummaryDto(avg, ratings.Count, ratings);
    }

    public async Task<RatingDto> RateServicePointAsync(Guid servicePointId, RateDto dto, CancellationToken ct = default)
    {
        Validate(dto.Score);
        var userId = _user.RequireUserId();
        if (!await _db.ServicePoints.AnyAsync(p => p.Id == servicePointId, ct))
            throw NotFoundException.For("Service point", servicePointId);

        var rating = await _db.ServicePointRatings.FirstOrDefaultAsync(r => r.ServicePointId == servicePointId && r.UserId == userId, ct);
        if (rating is null)
        {
            rating = new ServicePointRating { ServicePointId = servicePointId, UserId = userId };
            _db.ServicePointRatings.Add(rating);
        }
        rating.Score = dto.Score;
        rating.Comment = dto.Comment;
        await _db.SaveChangesAsync(ct);
        return new RatingDto(rating.Id, rating.UserId, rating.Score, rating.Comment, rating.CreatedAt);
    }

    public async Task<RatingDto> RateRequestAsync(Guid requestId, RateDto dto, CancellationToken ct = default)
    {
        Validate(dto.Score);
        var userId = _user.RequireUserId();
        var request = await _db.ServiceRequests.FirstOrDefaultAsync(r => r.Id == requestId, ct)
            ?? throw NotFoundException.For("Service request", requestId);
        if (request.CitizenId != userId)
            throw new ForbiddenException("You can only rate your own request.");
        if (request.Status != ServiceRequestStatus.Completed)
            throw new ConflictException("Only completed requests can be rated.");

        var rating = await _db.ServiceRequestRatings.FirstOrDefaultAsync(r => r.ServiceRequestId == requestId, ct);
        if (rating is null)
        {
            rating = new ServiceRequestRating { ServiceRequestId = requestId, UserId = userId };
            _db.ServiceRequestRatings.Add(rating);
        }
        rating.Score = dto.Score;
        rating.Comment = dto.Comment;
        await _db.SaveChangesAsync(ct);
        return new RatingDto(rating.Id, rating.UserId, rating.Score, rating.Comment, rating.CreatedAt);
    }

    private static void Validate(int score)
    {
        if (score is < 1 or > 5)
            throw new ConflictException("Score must be between 1 and 5.");
    }
}
