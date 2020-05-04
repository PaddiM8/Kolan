
using System.Linq;
using Neo4jClient;
using System;
using Neo4jClient.Transactions;

namespace Kolan
{
    public class Database
    {
        public static ITransactionalGraphClient Client;

        public void Init()
        {
            Init(Config.Values.DatabaseUrl,
                 Config.Values.DatabaseUser,
                 Config.Values.DatabasePassword);
        }

        public void Init(string url, string user, string password)
        {
            // Create graph client
            Client = new GraphClient(new Uri(url), user, password);
            Client.Connect();

            // Check if empty, if so, start setup process
            var query = Client.Cypher.Match("(n)")
                                     .Return(n => n.As<object>())
                                     .Limit(1);
            if (query.Results.Count() == 0)
                Setup();
        }

        public void Setup()
        {
            try
            {
                // Constraints
                Client.Cypher.CreateUniqueConstraint("u:User", "u.username")
                             .ExecuteWithoutResults();
                Client.Cypher.CreateUniqueConstraint("g:Group", "g.id")
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
