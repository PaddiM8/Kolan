using System.Threading.Tasks;
using Neo4jClient;
using Kolan.Models;
using System;
namespace Kolan.Repositories
{
    public class GroupRepository : Repository<User>
    {
        private readonly Generator _generator;

        public GroupRepository(IGraphClient client)
            : base(client)
        {
            _generator = new Generator();
        }

        public async Task<string> AddAsync(string boardId, Group group)
        {
            string id = _generator.NewId(boardId);
            group.Id = id;

            await Client.Cypher
                .Match("(board:Board)")
                .Where((Board board) => board.Id == boardId)
                .Create("(board)-[rel:ChildGroup]->(group:Group {group})-[:Next]->(:End)")
                .WithParam("group", group)
                .With("board, rel")
                .Match("(board)-[:ChildGroup]->(existingGroup)")
                .With("rel, count(existingGroup) AS groupAmount")
                .Set("rel.order = groupAmount - 1")
                .ExecuteWithoutResultsAsync();

            return id;
        }

        public async Task RemoveAsync(string groupId)
        {
            await Client.Cypher
                .Match("(:Board)-[rel:ChildGroup]->(group:Group)-[nextRel:Next]->(end:End)") // Only remove empty groups
                .Where((Group group) => group.Id == groupId)
                .Delete("rel, nextRel, group, end")
                .ExecuteWithoutResultsAsync();
        }
    }
}
