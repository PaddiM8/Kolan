using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using System.Web;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using Kolan.Models;
using Kolan.Repositories;
using Kolan.Hubs;
using Kolan.Filters;

namespace Kolan.Controllers.Api
{
    [Produces("application/json")]
    [Route("api/Boards")]
    public class BoardsController : Controller
    {
        private readonly IHubContext<BoardHub, IBoardClient> _boardHubContext;
        private readonly UnitOfWork _uow;

        public BoardsController(UnitOfWork uow, IHubContext<BoardHub, IBoardClient> boardHubContext)
        {
            _uow = uow;
            _boardHubContext = boardHubContext;
        }

        /// <summary>
        /// Get all root boards from a user.
        /// </summary>
        [HttpGet]
        public async Task<object> GetAll()
        {
            return await _uow.Boards.GetAllAsync(User.Identity.Name);
        }

        /// <summary>
        /// Get the content of a board. This includes the board node itself and groups with child boards.
        /// </summary>
        /// <param name="id">Id of the board to get</param>
        /// <returns>Board, Groups (containing boards)</returns>
        /// <response code="404">If the board doesn't exist</response>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBoard(string id)
        {
            var result = await _uow.Boards.GetAsync(id);
            if (result == null) return NotFound();

            return Ok(result);
        }

        /// <summary>
        /// Initialise a board to make it ready for use. This needs to be done before you can edit it.
        /// </summary>
        /// <returns>The groups added by default</returns>
        [HttpPost("{id}/Setup")]
        public async Task<object> Setup(string id)
        {
            return await _uow.Boards.SetupAsync(id);
        }

        /// <summary>
        /// Create a root board for a user.
        /// </summary>
        /// <param name="board">Board object</param>
        /// <returns>The id assigned to the new board</returns>
        [HttpPost]
        [ValidateModel]
        public async Task<IActionResult> Create([FromForm]Board board)
        {
            string id = await _uow.Boards.AddAsync(board, User.Identity.Name); // Add board to current user

            return Ok(new { id = id });
        }

        /// <summary>
        /// Create a child board inside another board.
        /// </summary>
        /// <param name="parentId">Parent board id</param>
        /// <param name="groupId">Id of group to create it under</param>
        /// <param name="board">Board object</param>
        /// <returns>The id assigned to the new board</returns>
        [HttpPost("{parentId}")]
        [ValidateModel]
        public async Task<IActionResult> Create(string parentId, [FromForm]string groupId, [FromForm]Board board)
        {
            string id = await _uow.Boards.AddAsync(board, groupId,
                                                   User.Identity.Name); // Add board to parent board
            await _boardHubContext.Clients.Group(parentId).ReceiveNewBoard(board, groupId); // Send to client

            return Ok(new { id = id });
        }

        /// <summary>
        /// Edit a child board.
        /// </summary>
        /// <param name="parentId">Parent board id</param>
        /// <param name="newBoardContent">Board object with the new values, containing the board id</param>
        [HttpPut("{parentId}")]
        [ValidateModel]
        public async Task<IActionResult> Edit(string parentId, [FromForm]Board newBoardContent)
        {
            await _uow.Boards.EditAsync(newBoardContent);
            await _boardHubContext.Clients.Group(parentId).EditBoard(newBoardContent);

            return Ok();
        }

        /// <summary>
        /// Delete a child board
        /// </summary>
        /// <param name="parentId">Parent board id</param>
        /// <param name="boardId">Id of the board to delete</param>
        [HttpDelete("{parentId}")]
        public async Task<IActionResult> Delete(string parentId, [FromForm]string boardId)
        {
            await _uow.Boards.DeleteAsync(boardId);
            await _boardHubContext.Clients.Group(parentId).DeleteBoard(boardId);

            return Ok();
        }

        /// <summary>
        /// Move a root board.
        /// </summary>
        /// <param name="boardId">Id of the board to move</param>
        /// <param name="targetId">Id of the board it will be placed under</param>
        [HttpPost("ChangeOrder")]
        public async Task<IActionResult> ChangeOrder([FromForm]string boardId, [FromForm]string targetId)
        {
            await _uow.Boards.MoveAsync(User.Identity.Name, boardId, targetId, true);

            return Ok();
        }

        /// <summary>
        /// Move a child board.
        /// </summary>
        /// <param name="parentId">Parent board id</param>
        /// <param name="boardId">Id of the board to move</param>
        /// <param name="targetId">Id of the board it will be placed under</param>
        [HttpPost("{parentId}/ChangeOrder")]
        public async Task<IActionResult> ChangeOrder(string parentId, [FromForm]string
                boardId, [FromForm]string targetId)
        {
            await _uow.Boards.MoveAsync(parentId, boardId, targetId, false);
            await _boardHubContext.Clients.Group(parentId).MoveBoard(boardId, targetId); // Send to client

            return Ok();
        }

        /// <summary>
        /// Get a list of a boards collaborators.
        /// </summary>
        /// <param name="id">Id of the board</param>
        /// <returns>A list of usernames (as strings)</returns>
        [HttpGet("{id}/Users")]
        public async Task<object> GetUsers(string id)
        {
            return await _uow.Boards.GetUsersAsync(id);
        }

        /// <summary>
        /// Add a user to a board as a collaborator.
        /// </summary>
        /// <param name="id">Id of the board</param>
        /// <param name="username">Username of the user to add</param>
        [HttpPost("{id}/Users")]
        public async Task<IActionResult> AddUser(string id, [FromForm]string username)
        {
            bool userAdded = await _uow.Boards.AddUserAsync(id, username);

            return userAdded ? (IActionResult)Ok() : (IActionResult)BadRequest();
        }

        /// <summary>
        /// Remove a collaborator from a board.
        /// </summary>
        /// <param name="id">Id of the board</param>
        /// <param name="username">Username of the user to remove</param>
        [HttpDelete("{id}/Users")]
        public async Task<IActionResult> RemoveUser(string id, [FromForm]string username)
        {
            await _uow.Boards.RemoveUserAsync(id, username);

            return Ok();
        }
    }
}
