using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Kolan.Models;
using Kolan.Repositories;
using Kolan.Hubs;
using Kolan.Filters;
using System;

namespace Kolan.Controllers.Api
{
    [Produces("application/json")]
    [Route("api/Groups")]
    [Authorize]
    public class GroupsController : Controller
    {
        private readonly IHubContext<BoardHub, IBoardClient> _boardHubContext;
        private readonly UnitOfWork _uow;

        public GroupsController(UnitOfWork uow, IHubContext<BoardHub, IBoardClient> boardHubContext)
        {
            _uow = uow;
            _boardHubContext = boardHubContext;
        }

        /// <summary>
        /// Create a new group inside a board
        /// </summary>
        /// <param name="boardId">Parent board id</param>
        /// <param name="group">Group object to add</param>
        [HttpPost]
        [AuthorizeForBoard("boardId")]
        public async Task<IActionResult> Create([FromForm]string boardId, GroupNode group)
        {
            string id = await _uow.Groups.AddAsync(boardId, group);

            return Ok(new { id = id });
        }

        /// <summary>
        /// Delete a group
        /// </summary>
        /// <param name="id">Id of group to delete</param>
        /// <param name="boardId">Parent board id</param>
        [HttpDelete("{id}")]
        [AuthorizeForBoard("boardId")]
        public async Task<IActionResult> Delete(string id, [FromForm]string boardId)
        {
            await _uow.Groups.RemoveAsync(id);

            return Ok();
        }
    }
}
