using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Neo4jClient;
using Kolan.Models;

namespace Kolan.Repositories
{
    public class UserRepository : Repository<User>
    {
        public UserRepository(GraphClient client)
            : base(client)
        {
        }

        public async Task AddAsync(User entity)
        {
            await Client.Cypher
                .Create("(u:User {newUser})-[:ChildGroup]->(g:Group {newGroup})")
                .WithParam("newUser", entity)
                .WithParam("newGroup", new Group { Name = "root" })
                .ExecuteWithoutResultsAsync();
        }
    }
}
