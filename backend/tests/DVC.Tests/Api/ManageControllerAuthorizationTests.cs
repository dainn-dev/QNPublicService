using DVC.Api.Controllers;
using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Xunit;

namespace DVC.Tests.Api;

/// <summary>
/// The /api/manage/* surface must stay restricted to officer/admin/super; anonymous or
/// citizen callers get 401/403 from the framework. Guarding the attribute guards the contract.
/// </summary>
public sealed class ManageControllerAuthorizationTests
{
    [Theory]
    [InlineData(typeof(ManageStatsController))]
    [InlineData(typeof(ManageOfficersController))]
    [InlineData(typeof(ManageRequestsController))]
    [InlineData(typeof(ManageFeedbackController))]
    public void ManageControllers_RequireOfficerAdminOrSuperRole(Type controller)
    {
        var authorize = controller.GetCustomAttributes(typeof(AuthorizeAttribute), inherit: false)
            .Cast<AuthorizeAttribute>()
            .ToList();

        authorize.Should().ContainSingle();
        authorize[0].Roles.Should().Be("officer,admin,super");
    }

    [Theory]
    [InlineData(typeof(ManageStatsController), "Overview")]
    [InlineData(typeof(ManageStatsController), "RequestsByMonth")]
    [InlineData(typeof(ManageStatsController), "FeedbackByCategory")]
    [InlineData(typeof(ManageStatsController), "FeedbackHeatmap")]
    [InlineData(typeof(ManageOfficersController), "List")]
    [InlineData(typeof(ManageRequestsController), "AddComment")]
    [InlineData(typeof(ManageRequestsController), "AddDocument")]
    [InlineData(typeof(ManageNotificationsController), "Push")]
    [InlineData(typeof(ManageNotificationsController), "Broadcast")]
    [InlineData(typeof(ManageNotificationsController), "Emergency")]
    [InlineData(typeof(ManageNotificationsController), "History")]
    public void NewEndpoints_DoNotAllowAnonymous(Type controller, string action)
    {
        var method = controller.GetMethod(action);

        method.Should().NotBeNull();
        method!.GetCustomAttributes(typeof(AllowAnonymousAttribute), inherit: false).Should().BeEmpty();
    }

    [Fact]
    public void ManageNotificationsController_IsRestrictedToAdminAndSuper()
    {
        var authorize = typeof(ManageNotificationsController)
            .GetCustomAttributes(typeof(AuthorizeAttribute), inherit: false)
            .Cast<AuthorizeAttribute>()
            .ToList();

        authorize.Should().ContainSingle();
        authorize[0].Roles.Should().Be("admin,super");
    }
}
