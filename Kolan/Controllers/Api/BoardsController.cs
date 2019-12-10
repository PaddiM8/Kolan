using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
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
        private readonly UnitOfWork _uow;
        private readonly IHubContext<BoardHub, IBoardClient> _boardHubContext;

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
            return await _uow.Boards.GetAsync(id, User.Identity.Name);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm]string name, [FromForm]string description)
        {
            var board = new Board
            {
                Name = name,
                Description = description
            };

            string id = await _uow.Boards.AddAsync(board, User.Identity.Name); // Add board to current user

            return Ok(new { id = id });
        }

        [HttpPost("{parentId}")]
        public async Task<IActionResult> Create(string parentId, string groupName,
                [FromForm]string name, [FromForm]string description)
        {
            var board = new Board
            {
                Name = name,
                Description = description
            };

            string id = await _uow.Boards.AddAsync(board, parentId, groupName, User.Identity.Name); // Add board to parent board
            await _boardHubContext.Clients.Group(parentId).ReceiveNewBoard(board, groupName); // Send to client

            return Ok(new { id = id });
        }

        [Route("ChangeOrder")]
        [HttpPost("{parentId}")]
        public async Task<IActionResult> ChangeOrder(string parentId, [FromForm]string boardId, [FromForm]string targetId)
        {
            await _uow.Boards.MoveAsync(parentId, boardId, targetId, false);

            return new EmptyResult();
        }

        [Route("ChangeOrder")]
        [HttpPost]
        public async Task<IActionResult> ChangeOrder([FromForm]string boardId, [FromForm]string targetId)
        {
            await _uow.Boards.MoveAsync(User.Identity.Name, boardId, targetId, true);

            return new EmptyResult();
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
