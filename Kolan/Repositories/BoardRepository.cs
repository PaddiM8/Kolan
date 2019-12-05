using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Neo4jClient;
using Kolan.Models;

namespace Kolan.Repositories
{
    public class BoardRepository : Repository<Board>
    {
        private Generator _generator;

        public BoardRepository(GraphClient client)
            : base(client)
        {
            _generator = new Generator();
        }

        /// <summary>
        /// Return all the root boards of a user.
        /// <param name="usernem">User to get the boards from.</param>
        /// </summary>
        public async Task<object> GetAllAsync(string username)
        {
            return await Client.Cypher
                .Match("(user:User)-[:ChildGroup]->(group:Group)-[rel:ChildBoard]->(board:Board)")
                .Where((User user) => user.Username == username)
                .Return((rel, board) => new { Relationship = rel.As<ChildBoardRelationship>(),
                                              Board = board.As<Board>() })
                .OrderBy("rel.index")
                .ResultsAsync;
        }

        public async Task<object> GetAsync(string id, string username)
        {

            var result = await Client.Cypher
                .Match("(board:Board)-[:ChildGroup]->(group:Group)")
                .Where((Board board) => board.Id == id)
                .Return((board, group) => new
                        {
                            Board = board.As<Board>(),
                            Group = group.As<Group>()
                        })
                .ResultsAsync;

            if (result.Count() == 0)
            {
                await Client.Cypher
                    .Match("(board:Board)")
                    .Where((Board board) => board.Id == id)
                    .Create("(board)-[:ChildGroup]->(:Group { name: 'Backlog' })")
                    .Create("(board)-[:ChildGroup]->(:Group { name: 'In Progress' })")
                    .Create("(board)-[:ChildGroup]->(:Group { name: 'Done' })")
                    .ExecuteWithoutResultsAsync();
            }

            Console.WriteLine(JsonConvert.SerializeObject(result));

            return result;
        }

        /// <summary>
        /// Add a root board to a user.
        /// <param name="username">User to add it to.</param>
        /// </summary>
        public async Task<string> AddAsync(Board entity, string username)
        {
            string id = _generator.NewId(username);

            await Client.Cypher
                .Match("(user:User)-[:ChildGroup]->(group:Group)")
                .Where((User user) => user.Username == username)
                .Create("(group)-[rel:ChildBoard {index: group.amount}]->(board:Board {newBoard})")
                .WithParam("newBoard", entity)
                .Set("group.amount = group.amount + 1")
                .Set($"board.id = '{id}'")
                .ExecuteWithoutResultsAsync();

            return id;
        }

        /// <summary>
        /// Swap the indexes of two root boards.
        /// <param name="fromIndex">First index</param>
        /// <param name="toIndex">Second index</param>
        /// <param name="username">User with the boards.</param>
        /// </summary>
        public async Task SwapAsync(int fromIndex, int toIndex, string username)
        {
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

        /// <summary>
        /// Add a user to board for collaboration
        /// </summary>
        /// <param name="boardId">Id of the relevant board</param>
        /// <param name="username">Username of user to add</param>
        public async Task AddUserAsync(string boardId, string username)
        {
            Console.ForegroundColor = ConsoleColor.Blue;
            Console.WriteLine("boardId: " + boardId + ", username: " + username);
            await Client.Cypher
                .Match("(board:Board), (user:User)-[:ChildGroup]->(group:Group)")
                .Where((Board board) => board.Id == boardId)
                .AndWhere((User user) => user.Username == username)
                .Create("(group)-[:ChildBoard]->(board)")
                .ExecuteWithoutResultsAsync();
        }

        /// <summary>
        /// Remove a user from being able to edit the board
        /// </summary>
        /// <param name="boardId">Id of the relevant board</param>
        /// <param name="username">Username of user to remove</param>
        public async Task RemoveUserAsync(string boardId, string username)
        {
            await Client.Cypher
                .Match("(board:Board)", 
                       "(user:User)-[:ChildGroup]->(group:Group)-[rel:ChildBoard]->(board)")
                .Where((Board board) => board.Id == boardId)
                .AndWhere((User user) => user.Username == username)
                .Delete("rel")
                .ExecuteWithoutResultsAsync();
        }
    }
}
