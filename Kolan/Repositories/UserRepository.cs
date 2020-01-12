using System.Threading.Tasks;
using Neo4jClient;
using Kolan.Models;
using System.Linq;
using System.Collections;

namespace Kolan.Repositories
{
    public class UserRepository : Repository<User>
    {
        public UserRepository(IGraphClient client)
            : base(client)
        {
        }

        /// <summary>
        /// Create a user
        /// </summary>
        public async Task AddAsync(User entity)
        {
            await Client.Cypher
                .Create("(u:USER {newUser})-[:CHILD_GROUP]->(g:GROUP {newGroup})-[:NEXT]->(:End)")
                .WithParam("newUser", entity)
                .WithParam("newGroup", new Group { Name = "root", Id = entity.Username })
                .ExecuteWithoutResultsAsync();
        }

        public async Task<bool> ValidatePassword(string username, string password)
        {
            var result = await Client.Cypher
                .Match("(user:USER)")
                .Where((User user) => user.Username == username)
                .Return((user) => user.As<User>().Password)
                .ResultsAsync;

            return PBKDF2.Validate(password, result.SingleOrDefault());
        }

        public async Task ChangePassword(string username, string newPassword)
        {
            await Client.Cypher
                .Match("(user:USER)")
                .Where((User user) => user.Username == username)
                .Set("user.password = {password}")
                .WithParam("password", PBKDF2.Hash(newPassword))
                .ExecuteWithoutResultsAsync();
        }
    }
}
