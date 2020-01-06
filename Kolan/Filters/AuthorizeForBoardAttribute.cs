using System;
using System.Threading.Tasks;
using Kolan.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Newtonsoft.Json;

namespace Kolan.Filters
{
    class AuthorizeForBoardAttribute : AuthorizeAttribute, IAsyncAuthorizationFilter
    {
        private readonly UnitOfWork _uow = new UnitOfWork(Database.Client);

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            string boardId = (string)context.HttpContext.Request.RouteValues["id"];
            string username = context.HttpContext.User.Identity.Name;
            if (await _uow.Boards.UserHasAccess(boardId, username) == false)
            {
                context.Result = new UnauthorizedResult();
            }
        }
    }
}
