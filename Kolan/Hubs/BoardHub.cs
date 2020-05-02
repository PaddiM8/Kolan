using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Kolan.Models;
using Kolan.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Kolan.Enums;
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

        /// <summary>
        /// Join a board
        /// </summary>
        /// <param name="boardId">Id of board to join</param>
        public async Task<IActionResult> Join(string boardId)
        {
            if (await _uow.Boards.GetUserPermissionLevel(boardId, Context.User.Identity.Name) >= PermissionLevel.Edit)
            {
                return new OkObjectResult(Groups.AddToGroupAsync(Context.ConnectionId, boardId));
            }

            return new UnauthorizedResult();
        }

        /// <summary>
        /// Create a new board
        /// </summary>
        /// <param name="parentId">Parent board id</param>
        /// <param name="board">Board object</param>
        /// <param name="groupId">Id of the group to add it under</param>
        public async Task<IActionResult> AddBoard(string parentId, BoardTask board, string groupId)
        {
            var validation = ModelValidator.Validate(board);
            if (!validation.isValid) return new BadRequestObjectResult(validation.errors);

            string id = await _uow.Boards.AddAsync(board, groupId, Context.User.Identity.Name);
            board.Id = id;
            await Clients.Group(parentId).ReceiveNewBoard(board, groupId);

            return new OkObjectResult(new { id = id });
        }

        /// <summary>
        /// Move a board
        /// </summary>
        /// <param name="parentId">Parent board id</param>
        /// <param name="boardId">Id of board to move</param>
        /// <param name="targetId">Id of board to move it to (underneath)</param>
        public async Task MoveBoard(string parentId, string boardId, string targetId)
        {
            await Clients.Group(parentId).MoveBoard(boardId, targetId);
            await _uow.Boards.MoveAsync(parentId, boardId, targetId, false);
        }

        /// <summary>
        /// Edit a board
        /// </summary>
        /// <param name="parentId">Parent board id</param>
        /// <param name="newBoardContents">Board object with the new contents</param>
        public async Task<IActionResult> EditBoard(string parentId, BoardTask newBoardContents)
        {
            var validation = ModelValidator.Validate(newBoardContents);
            if (!validation.isValid) return new BadRequestObjectResult(validation.errors);

            await Clients.Group(parentId).EditBoard(newBoardContents);
            await _uow.Boards.EditAsync(newBoardContents);

            return new OkObjectResult("");
        }

        /// <summary>
        /// Delete a board
        /// </summary>
        /// <param name="parentId">Parent board id</param>
        /// <param name="id">Board id</param>
        public async Task DeleteBoard(string parentId, string id)
        {
            await Clients.Group(parentId).DeleteBoard(id);
            await _uow.Boards.DeleteAsync(id);
        }

        /// <summary>
        /// Request all clients to reload
        /// </summary>
        /// <remarks>
        /// This is done when they urgently need to get new board information, in order to avoid collisions.
        /// </remarks>
        /// <param name="id">Id of board</param>
        public async Task RequestReload(string id)
        {
            await Clients.Group(id).RequestReload();
        }
    }
}
