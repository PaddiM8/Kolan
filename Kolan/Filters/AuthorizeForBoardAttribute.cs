using System.Threading.Tasks;
using Kolan.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Primitives;
using Microsoft.AspNetCore.Mvc;
using Kolan.Enums;
using System;

namespace Kolan.Filters
{
    class AuthorizeForBoardAttribute : AuthorizeAttribute, IAsyncAuthorizationFilter
    {
        public PermissionLevel PermissionLevel { get; set; } = PermissionLevel.Edit;
        public string IdParameter { get; set; }

        private static readonly UnitOfWork _uow = new UnitOfWork(Database.Client); // Temporary

        public AuthorizeForBoardAttribute(string idParameterName = "id")
        {
            IdParameter = idParameterName;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            string boardId = (string)context.HttpContext.Request.RouteValues[IdParameter];
            if (boardId == null)
            {
                StringValues formStringValues;
                context.HttpContext.Request.Form.TryGetValue(IdParameter, out formStringValues);
                boardId = formStringValues[0];
            }

            string username = context.HttpContext.User.Identity.Name;

            Console.WriteLine("Expects: " + this.PermissionLevel);
            Console.WriteLine("Got: " + await _uow.Boards.GetUserPermissionLevel(boardId, username));
            if (await _uow.Boards.GetUserPermissionLevel(boardId, username) < this.PermissionLevel)
            {
                context.Result = new UnauthorizedResult();
            }
        }
    }
}
