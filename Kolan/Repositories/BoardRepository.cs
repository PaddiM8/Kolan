using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Neo4jClient;
using Kolan.Models;

namespace Kolan.Repositories
{
    public class BoardRepository : Repository<Board>
    {
        public BoardRepository(GraphClient client)
            : base(client)
        {
        }

        public async Task<object> GetAllAsync(string username)
        {
            return await Client.Cypher
                .Match("(user:User)-[:ChildGroup]->(group:Group)-[rel:ChildBoard]->(board:Board)")
                .Where((User user) => user.Username == username)
                .Return((rel, board) => new { Relationship = rel.As<ChildBoardRelationship>(), Board = board.As<Board>() })
                .OrderBy("rel.index")
                .ResultsAsync;
        }

        public async Task AddAsync(Board entity, string username)
        {
            await Client.Cypher
                .Match("(user:User)-[:ChildGroup]->(group:Group)")
                .Where((User user) => user.Username == username)
                .Create("(group)-[rel:ChildBoard {index: group.amount}]->(board:Board {newBoard})")
                .WithParam("newBoard", entity)
                .Set("group.amount = group.amount + 1")
                .ExecuteWithoutResultsAsync();
        }

        public async Task SwapAsync(int fromIndex, int toIndex, string username)
        {
            Console.WriteLine(fromIndex + ", " + toIndex + ", " + username);
            await Client.Cypher
                .Match("(user:User)-[:ChildGroup]->(group:Group)-[rel:ChildBoard]->(:Board)",
                       "(group)-[rel2:ChildBoard]->(:Board)")
                .Where((User user) => user.Username == username)
                .AndWhere((ChildBoardRelationship rel) => rel.Index == fromIndex)
                .AndWhere((ChildBoardRelationship rel2) => rel2.Index == toIndex)
                .Set("rel.index = " + toIndex.ToString())
                .Set("rel2.index = " + fromIndex.ToString())
                .ExecuteWithoutResultsAsync();
        }
    }
}
