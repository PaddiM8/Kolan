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
    }
}
