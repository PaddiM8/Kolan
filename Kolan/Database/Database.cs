using System;
using System.Linq;
using System.Collections.Generic;
using Neo4jClient;

using Kolan.Controllers;
using Kolan.Repositories;

namespace Kolan
{
    static class Database
    {
        public static GraphClient Client;

        public static async void Init()
        {
            // Create graph client
            Client = new GraphClient(new Uri(Config.Values.DatabaseUrl),
                                     Config.Values.DatabaseUser,
                                     Config.Values.DatabasePassword);
            Client.Connect();

            // Check if empty, if so, start setup process
            var query = Client.Cypher.Match("(n)")
                                     .Return(n => n.As<object>())
                                     .Limit(1);
            if (query.Results.Count() == 0)
                Setup();

            // Debugging users
            new UserController(new UnitOfWork(Client)).Create("bakk", "pass");
            new UserController(new UnitOfWork(Client)).Create("domi", "pass");
            new UserController(new UnitOfWork(Client)).Create("liv", "pass");
            new UserController(new UnitOfWork(Client)).Create("bakk2", "pass");
        }

        public static void Setup()
        {
            try
            {
                // Constraints
                Client.Cypher.CreateUniqueConstraint("u:User", "u.username")
                             .ExecuteWithoutResults();
                Client.Cypher.CreateUniqueConstraint("b:Board", "b.id")
                             .ExecuteWithoutResults();
            }
            catch (NeoException)
            {
                return;
            }
        }
    }
}
