using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Kolan.Models;
using Kolan.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System;
using Newtonsoft.Json;

namespace Kolan.Hubs
{
    [Authorize]
    public class BoardHub : Hub<IBoardClient>
    {
        private readonly UnitOfWork _uow;

        public BoardHub(UnitOfWork uow)
        {
            _uow = uow;
        }

        [Authorize("BoardHubRestricted")]
        public async Task<IActionResult> Join(string boardId)
        {
            if (await _uow.Boards.UserHasAccess(boardId, Context.User.Identity.Name))
            {
                return new OkObjectResult(Groups.AddToGroupAsync(Context.ConnectionId, boardId));
            }

            return new UnauthorizedResult();
        }

        public async Task<IActionResult> AddBoard(string parentId, Board board, string groupId)
        {
            var validation = ModelValidator.Validate(board);
            if (!validation.isValid) return new BadRequestObjectResult(validation.errors);

            string id = await _uow.Boards.AddAsync(board, groupId, Context.User.Identity.Name);
            board.Id = id;
            await Clients.Group(parentId).ReceiveNewBoard(board, groupId);

            return new OkObjectResult(new { id = id });
        }

        public async Task MoveBoard(string parentId, string boardId, string targetId)
        {
            await Clients.Group(parentId).MoveBoard(boardId, targetId);
            await _uow.Boards.MoveAsync(parentId, boardId, targetId, false);
        }

        public async Task<IActionResult> EditBoard(string parentId, Board newBoardContents)
        {
            var validation = ModelValidator.Validate(newBoardContents);
            if (!validation.isValid) return new BadRequestObjectResult(validation.errors);

            await Clients.Group(parentId).EditBoard(newBoardContents);
            await _uow.Boards.EditAsync(newBoardContents);

            return new OkObjectResult("");
        }

        public async Task DeleteBoard(string parentId, string id)
        {
            await Clients.Group(parentId).DeleteBoard(id);
            await _uow.Boards.DeleteAsync(id);
        }

        /*private async Task<(bool isValid, List<ValidationResult> results)> ValidateModel(object obj)
        {
            var results = new List<ValidationResult>();
            bool isValid = Validator.TryValidateObject(obj, new ValidationContext(obj), results, true);

            return (isValid, results);
        }*/
    }
}
