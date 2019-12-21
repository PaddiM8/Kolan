using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Kolan.Models;

namespace Kolan.Hubs
{
    public class BoardHub : Hub<IBoardClient>
    {
        public Task Join(string boardId)
        {
            return Groups.AddToGroupAsync(Context.ConnectionId, boardId);
        }

        public Task AddBoard(string parentId, string groupId, Board board)
        {
            return Clients.Group(parentId).ReceiveNewBoard(board, groupId);
        }

        public Task MoveBoard(string parentId, string boardId, string targetId)
        {
            return Clients.Group(parentId).MoveBoard(boardId, targetId);
        }

        public Task EditBoard(string parentId, Board newBoardContents)
        {
            return Clients.Group(parentId).EditBoard(newBoardContents);
        }

        public Task DeleteBoard(string parentId, string id)
        {
            return Clients.Group(parentId).DeleteBoard(id);
        }
    }
}
