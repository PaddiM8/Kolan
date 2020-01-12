using System.Threading.Tasks;
using Kolan.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Primitives;

namespace Kolan.Filters
{
    class AuthorizeForBoardAttribute : AuthorizeAttribute, IAsyncAuthorizationFilter
    {
        private static readonly UnitOfWork _uow = new UnitOfWork(Database.Client); // Couldn't dependency inject...
        private readonly string _idParameterName;

        public AuthorizeForBoardAttribute(string idParameterName = "id")
        {
            _idParameterName = idParameterName;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            string boardId = (string)context.HttpContext.Request.RouteValues[_idParameterName];
            if (boardId == null)
            {
                StringValues formStringValues;
                context.HttpContext.Request.Form.TryGetValue(_idParameterName, out formStringValues);
                boardId = formStringValues[0];
            }

            string username = context.HttpContext.User.Identity.Name;

            if (await _uow.Boards.UserHasAccess(boardId, username) == false)
            {
                context.Result = new UnauthorizedResult();
            }
        }
    }
}
