using System;
using System.Collections.Generic;
using Neo4jClient;

namespace Kolan.Repositories
{
    public class UnitOfWork
    {
        public BoardRepository Boards { get; private set; }
        public GroupRepository Groups { get; private set; }
        public UserRepository  Users  { get; private set; }

        public UnitOfWork(IGraphClient client)
        {
            Boards = new BoardRepository(client);
            Groups = new GroupRepository(client);
            Users = new UserRepository(client);
        }
    }
}
