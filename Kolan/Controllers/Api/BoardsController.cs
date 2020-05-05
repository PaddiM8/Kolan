using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Kolan.Models;
using Kolan.Repositories;
using Kolan.Hubs;
using Kolan.Filters;
using Newtonsoft.Json;
using Kolan.Enums;
using System;
namespace Kolan.Controllers.Api
{
    [Produces("application/json")]
    [Route("api/Boards")]
    [Authorize]
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
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBoard(string id)
        {
            Board result = await _uow.Boards.GetAsync(id, User.Identity.Name);
            if (result == null) return NotFound();
            if (result.UserAccess == PermissionLevel.None) return Unauthorized(); // No AuthorizeForBoard attribute here since this GetAsync() already retrieves this (for other reason). Also, later on users should be able to make boards visible to the public

            return Ok(result);
        }

        /// <summary>
        /// Initialise a board to make it ready for use. This needs to be done before you can edit it.
        /// </summary>
        /// <remarks>
        /// If the provided list of group names is empty, the board will inherits its parents group names.
        /// </remarks>
        /// <param name="id">Id of board to set up</param>
        /// <param name="groups">List of group names to add during setup</param>
        /// <returns>The groups added by default</returns>
        [AuthorizeForBoard]
        [HttpPost("{id}/Setup")]
        public async Task<string[]> Setup(string id, [FromForm]string groups)
        {
            string[] groupNames = JsonConvert.DeserializeObject<string[]>(groups);

            return await _uow.Boards.SetupAsync(id, groupNames);
        }

        /// <summary>
        /// Create a root board for a user.
        /// </summary>
        /// <param name="board">Board object</param>
        /// <returns>The id assigned to the new board</returns>
        [HttpPost]
        [ValidateModel]
        public async Task<IActionResult> Create([FromForm] BoardTask board)
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
        [AuthorizeForBoard]
        public async Task<IActionResult> Create(string parentId, [FromForm]string groupId, [FromForm] BoardTask board)
        {
            string id = await _uow.Boards.AddAsync(board, groupId,
                                                   User.Identity.Name); // Add board to parent board
            await _boardHubContext.Clients.Group(parentId).ReceiveNewBoard(board, groupId); // Send to client

            return Ok(new { id = id });
        }

        /// <summary>
        /// Edit a board. (root or child)
        /// </summary>
        /// <param name="id">Board id</param>
        /// <param name="parentId">Parent board id</param>
        /// <param name="newBoardContent">Board object with the new values, containing the board id</param>
        [HttpPut("{id}")]
        [ValidateModel]
        [AuthorizeForBoard]
        public async Task<IActionResult> Edit(string id, string parentId, [FromForm]string newBoardContent)
        {
            var board = JsonConvert.DeserializeObject<BoardTask>(newBoardContent);
            var validation = ModelValidator.Validate(board);
            if (!validation.isValid) return BadRequest(validation.errors);

            await _uow.Boards.EditAsync(board);

            if (parentId != null)
            {
                await _boardHubContext.Clients.Group(parentId).EditBoard(board);
            }

            return Ok();
        }

        /// <summary>
        /// Delete a root board
        /// </summary>
        /// <param name="id">Id of the board to delete</param>
        [HttpDelete]
        [AuthorizeForBoard(PermissionLevel = PermissionLevel.All)]
        public async Task<IActionResult> Delete(string id)
        {
            await _uow.Boards.DeleteAsync(id);

            return Ok();
        }

        /// <summary>
        /// Delete a child board
        /// </summary>
        /// <param name="parentId">Parent board id</param>
        /// <param name="id">Id of the board to delete</param>
        [HttpDelete("{parentId}")]
        [AuthorizeForBoard("parentId")]
        public async Task<IActionResult> Delete(string parentId, [FromForm]string id)
        {
            await _uow.Boards.DeleteAsync(id);
            await _boardHubContext.Clients.Group(parentId).DeleteBoard(id);

            return Ok();
        }

        /// <summary>
        /// Move a root board.
        /// </summary>
        /// <param name="id">Id of the board to move</param>
        /// <param name="targetId">Id of the board it will be placed under</param>
        [HttpPost("Move")]
        [AuthorizeForBoard]
        public async Task<IActionResult> Move([FromForm]string id, [FromForm]string targetId)
        {
            await _uow.Boards.MoveAsync(User.Identity.Name, id, targetId, true);

            return Ok();
        }

        /// <summary>
        /// Move a child board.
        /// </summary>
        /// <param name="id">Parent board id</param>
        /// <param name="boardId">Id of the board to move</param>
        /// <param name="targetId">Id of the board it will be placed under</param>
        [HttpPost("{id}/ChangeOrder")]
        [AuthorizeForBoard]
        public async Task<IActionResult> ChangeOrder(string id, [FromForm]string
                boardId, [FromForm]string targetId)
        {
            await _uow.Boards.MoveAsync(id, boardId, targetId, false);
            await _boardHubContext.Clients.Group(id).MoveBoard(boardId, targetId); // Send to client

            return Ok();
        }

        [HttpPost("{id}/ChangeGroupOrder")]
        [AuthorizeForBoard]
        public async Task<IActionResult> ChangeGroupOrder(string id, [FromForm]string groupIds)
        {
            await _uow.Boards.SetGroupOrder(id, JsonConvert.DeserializeObject<string[]>(groupIds));

            return Ok();
        }

        [HttpPost("{id}/ChangePublicity")]
        [AuthorizeForBoard]
        public async Task<IActionResult> ChangePublicity(string id, [FromForm]bool publicity)
        {
            await _uow.Boards.SetPublicityAsync(id, publicity);

            return Ok();
        }

        /// <summary>
        /// Get a list of a boards collaborators.
        /// </summary>
        /// <param name="id">Id of the board</param>
        /// <returns>A list of usernames (as strings)</returns>
        [HttpGet("{id}/Users")]
        [AuthorizeForBoard]
        public async Task<object> GetUsers(string id)
        {
            return await _uow.Boards.GetUsersAsync(id);
        }

        /// <summary>
        /// Add a user to a board as a collaborator.
        /// </summary>
        /// <param name="id">Id of the board</param>
        /// <param name="username">Username of the user to add</param>
        /// <param name="encryptionKey">(This should be encrypted) Encryption key used to encrypt/decrypt the board.</param>
        [HttpPost("{id}/Users")]
        [AuthorizeForBoard]
        public async Task<IActionResult> AddUser(string id, [FromForm]string username, [FromForm]string encryptionKey = null)
        {
            bool userAdded = await _uow.Boards.AddUserAsync(id, username, encryptionKey);

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
            // Only do it if the current user is board owner or they are trying to remove themselves from the board.
            if (await _uow.Boards.GetUserPermissionLevel(id, User.Identity.Name) == PermissionLevel.All ||
                username == User.Identity.Name)
            {
                await _uow.Boards.RemoveUserAsync(id, username);
            }
            else
            {
                return Unauthorized();
            }

            return Ok();
        }
    }
}
