using System.Threading.Tasks;
using Kolan.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
namespace Kolan.Filters
{
    public class BoardRestrictedRequirement :
        AuthorizationHandler<BoardRestrictedRequirement, HubInvocationContext>,
        IAuthorizationRequirement
    {
        private static readonly UnitOfWork _uow = new UnitOfWork(Database.Client); // Temporary

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context,
            BoardRestrictedRequirement requirement, HubInvocationContext resource)
        {
            string boardId = (string)resource.HubMethodArguments[0];
            string username = context.User.Identity.Name;

            if (await _uow.Boards.UserHasAccess(boardId, username))
            {
                context.Succeed(requirement);
            }
        }
    }
}
