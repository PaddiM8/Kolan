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

namespace Kolan.Controllers.Api
{
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

        [HttpGet]
        public async Task<object> GetAll()
        {
             return await _uow.Boards.GetAllAsync(User.Identity.Name);
        }

        [HttpGet("{id}")]
        public async Task<object> GetBoard(string id)
        {
            return await _uow.Boards.GetAsync(id);
        }

        [HttpPost("{id}/Setup")]
        public async Task<object> Setup(string id)
        {
            return await _uow.Boards.SetupAsync(id);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm]Board board)
        {
            string id = await _uow.Boards.AddAsync(board, User.Identity.Name); // Add board to current user

            return Ok(new { id = id });
        }

        [HttpPost("{parentId}")]
        public async Task<IActionResult> Create(string parentId, [FromForm]string groupId, [FromForm]Board board)
        {
            string id = await _uow.Boards.AddAsync(board, groupId, User.Identity.Name); // Add board to parent board
            await _boardHubContext.Clients.Group(parentId).ReceiveNewBoard(board, groupId); // Send to client

            return Ok(new { id = id });
        }

        [HttpPut("{parentId}")]
        public async Task<IActionResult> Edit(string parentId, [FromForm]Board newBoardContent)
        {
            await _uow.Boards.EditAsync(newBoardContent);
            await _boardHubContext.Clients.Group(parentId).EditBoard(newBoardContent);

            return new EmptyResult();
        }

        [HttpDelete("{parentId}")]
        public async Task<IActionResult> Delete(string parentId, [FromForm]string boardId)
        {
            await _uow.Boards.DeleteAsync(boardId);
            await _boardHubContext.Clients.Group(parentId).DeleteBoard(boardId);

            return new EmptyResult();
        }

        [Route("ChangeOrder")]
        [HttpPost("{parentId}/ChangeOrder")]
        public async Task<IActionResult> ChangeOrder(string parentId, [FromForm]string boardId, [FromForm]string targetId)
        {
            await _uow.Boards.MoveAsync(parentId, boardId, targetId, false);
            await _boardHubContext.Clients.Group(parentId).MoveBoard(boardId, targetId); // Send to client

            return new EmptyResult();
        }

        [Route("ChangeOrder")]
        [HttpPost("ChangeOrder")]
        public async Task<IActionResult> ChangeOrder([FromForm]string boardId, [FromForm]string targetId)
        {
            await _uow.Boards.MoveAsync(User.Identity.Name, boardId, targetId, true);

            return new EmptyResult();
        }

        [Route("{id}/Users")]
        [HttpGet]
        public async Task<object> GetUsers(string id)
        {
            return await _uow.Boards.GetUsersAsync(id);
        }

        [Route("{id}/Users")]
        [HttpPost]
        public async Task<IActionResult> AddUser(string id, [FromForm]string username)
        {
            await _uow.Boards.AddUserAsync(id, username);

            return new EmptyResult();
        }

        [Route("{id}/Users")]
        [HttpDelete]
        public async Task<IActionResult> RemoveUser(string id, [FromForm]string username)
        {
            await _uow.Boards.RemoveUserAsync(id, username);

            return new EmptyResult();
        }
    }
}
