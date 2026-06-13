using DVC.Domain.Common;

namespace DVC.Application.Common;

/// <summary>
/// SLA due-date calculations. Requests are due a number of <em>working days</em> (skipping
/// weekends) after submission; feedback reports are due a number of calendar days driven by
/// their priority. Feedback day counts are the BA/PM-proposed defaults (Urgent=1, High=3,
/// Normal=5, Low=7) and live here so they can be tuned in one place.
/// </summary>
public static class Sla
{
    /// <summary>Adds <paramref name="workingDays"/> business days to <paramref name="start"/>,
    /// skipping Saturdays and Sundays and preserving the time of day. Non-positive counts return
    /// <paramref name="start"/> unchanged.</summary>
    public static DateTime AddWorkingDays(DateTime start, int workingDays)
    {
        if (workingDays <= 0) return start;

        var date = start;
        var added = 0;
        while (added < workingDays)
        {
            date = date.AddDays(1);
            if (date.DayOfWeek is not (DayOfWeek.Saturday or DayOfWeek.Sunday))
                added++;
        }
        return date;
    }

    /// <summary>The number of calendar days a feedback report of the given priority has before
    /// it is due.</summary>
    public static int FeedbackDueDays(FeedbackPriority priority) => priority switch
    {
        FeedbackPriority.Urgent => 1,
        FeedbackPriority.High => 3,
        FeedbackPriority.Normal => 5,
        FeedbackPriority.Low => 7,
        _ => 5
    };

    /// <summary>The due date for a feedback report submitted at <paramref name="submittedAt"/>
    /// with the given priority.</summary>
    public static DateTime FeedbackDueAt(DateTime submittedAt, FeedbackPriority priority) =>
        submittedAt.AddDays(FeedbackDueDays(priority));
}
