using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Kolan.Models;
using Kolan.Repositories;
using Microsoft.AspNetCore.Mvc;
using System;
using Newtonsoft.Json;

namespace Kolan.Hubs
{
    public class BoardHub : Hub<IBoardClient>
    {
        private readonly UnitOfWork _uow;

        public BoardHub(UnitOfWork uow)
        {
            _uow = uow;
        }

        public Task Join(string boardId)
        {
            return Groups.AddToGroupAsync(Context.ConnectionId, boardId);
        }

        public async Task<IActionResult> AddBoard(string parentId, Board board, string groupId)
        {
            await Clients.Group(parentId).ReceiveNewBoard(board, groupId);
            string id = await _uow.Boards.AddAsync(board, groupId, "bakk"); // TODO: Username!

            return new OkObjectResult(new { id = id });
        }

        public async Task MoveBoard(string parentId, string boardId, string targetId)
        {
            await Clients.Group(parentId).MoveBoard(boardId, targetId);
            await _uow.Boards.MoveAsync(parentId, boardId, targetId, false);
        }

        public async Task EditBoard(string parentId, Board newBoardContents)
        {
            await Clients.Group(parentId).EditBoard(newBoardContents);
            await _uow.Boards.EditAsync(newBoardContents);
        }

        public async Task DeleteBoard(string parentId, string id)
        {
            await Clients.Group(parentId).DeleteBoard(id);
            await _uow.Boards.DeleteAsync(id);
        }
    }
}
