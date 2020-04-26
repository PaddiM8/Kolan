using System;
using System.Threading.Tasks;
using Neo4jClient;
using Kolan.Models;
using System.Linq;
using Newtonsoft.Json;

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
                .Create("(u:User {newUser})-[:CHILD_GROUP]->(g:Group {newGroup})-[:NEXT]->(:End)")
                .WithParam("newUser", entity)
                .WithParam("newGroup", new Group { Name = "root", Id = entity.Username })
                .ExecuteWithoutResultsAsync();
        }

        public async Task<string> GetPublicKey(string username)
        {
            return (await Client.Cypher
                .Match("(user:User)")
                .Where((User user) => user.Username == username)
                .Return<string>("user.publicKey")
                .ResultsAsync)
                .SingleOrDefault();
        }

        public async Task<string> GetPrivateKey(string username)
        {
            return (await Client.Cypher
                .Match("(user:User)")
                .Where((User user) => user.Username == username)
                .Return<string>("user.privateKey")
                .ResultsAsync)
                .SingleOrDefault();
        }

        public async Task<bool> ValidatePasswordAsync(string username, string password)
        {
            var result = await Client.Cypher
                .Match("(user:User)")
                .Where((User user) => user.Username == username)
                .Return((user) => user.As<User>().Password)
                .ResultsAsync;

            if (result.Count() == 0) return false;

            return PBKDF2.Validate(password, result.SingleOrDefault());
        }

        public async Task ChangePasswordAsync(string username, string newPassword)
        {
            await Client.Cypher
                .Match("(user:User)")
                .Where((User user) => user.Username == username)
                .Set("user.password = {password}")
                .WithParam("password", PBKDF2.Hash(newPassword))
                .ExecuteWithoutResultsAsync();
        }

        public async Task DeleteAsync(string username)
        {
            await Client.Cypher
                .Match("path=(user:User)-[:CHILD_GROUP|CHILD_BOARD|NEXT]->(n1)-[:CHILD_GROUP|CHILD_BOARD|NEXT*0..]->(n2)")
                .Where((User user) => user.Username == username)
                .With("relationships(path) as rels, n1, n2, user")
                .Unwind("rels", "rel")
                .Delete("rel, n1, n2, user")
                .ExecuteWithoutResultsAsync();
        }
    }
}
