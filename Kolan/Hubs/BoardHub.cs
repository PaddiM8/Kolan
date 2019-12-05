using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace Kolan.Hubs
{
    public class BoardHub : Hub
    {
        public Task Join(string boardId)
        {
            return Groups.AddToGroupAsync(Context.ConnectionId, boardId);
        }

        public Task Send(string boardId, string message)
        {
            Console.ForegroundColor = ConsoleColor.Blue;
            Console.WriteLine("Hello: " + message);
            return Clients.Group(boardId).SendAsync("ReceiveMessage", message);
        }
    }
}
