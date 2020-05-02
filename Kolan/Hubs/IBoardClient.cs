using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Kolan.Models;

namespace Kolan.Hubs
{
    public interface IBoardClient
    {
        Task ReceiveNewBoard(BoardTask board, string groupName);
        Task MoveBoard(string boardId, string targetId);
        Task EditBoard(BoardTask newBoardContents);
        Task DeleteBoard(string id);
        Task RequestReload();
    }
}
