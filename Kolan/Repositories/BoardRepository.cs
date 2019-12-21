using System;
using System.Linq;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Neo4jClient;
using Neo4jClient.Cypher;
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
        /// <param name="username">User to get the boards from.</param>
        /// </summary>
        public async Task<object> GetAllAsync(string username)
        {
            return await Client.Cypher
                .Match("(user:User)-[:ChildGroup]->(:Group)-[:Next*]->(board)-[:Next]->(:End)")
                .Where((User user) => user.Username == username)
                .OptionalMatch("(board)-[:SharedBoard]->(shared:Board)")
                .Return((board, shared) => new
                        {
                            Board = board.As<Board>(),
                            Shared = shared.As<Board>()
                        })
                .ResultsAsync;
        }

        /// <summary>
        /// Return the groups and boards from a parent board.
        /// </summary>
        /// <param name="id">Parent board id</param>
        public async Task<object> GetAsync(string id)
        {
            var result = await Client.Cypher
                .Match("(parentBoard:Board)-[:ChildGroup]->(group:Group)")
                .Where((Board parentBoard) => parentBoard.Id == id)
                .OptionalMatch("(group)-[:Next*]->(board:Board)-[:Next*]->(:End)")
                .With("parentBoard, {group: group, boards: collect(board)} AS groups")
                .Return((parentBoard, groups) => new
                        {
                            Board = parentBoard.As<Board>(),
                            Groups = groups.CollectAs<GroupsObject>()
                        })
                .ResultsAsync;

            return result;
        }

        /// <summary>
        /// Add a root board to a user.
        /// <param name="username">User to add it to.</param>
        /// </summary>
        public async Task<string> AddAsync(Board entity, string username)
        {
            string id = _generator.NewId(username);
            entity.Id = id;

            await Client.Cypher
                .Match("(user:User)-[:ChildGroup]->(previous)-[oldRel:Next]->(next)")
                .Where((User user) => user.Username == username)
                .Call("apoc.lock.nodes([user])")
                .Create("(previous)-[:Next]->(board:Board {newBoard})-[:Next]->(next)")
                .WithParam("newBoard", entity)
                .Delete("oldRel")
                .ExecuteWithoutResultsAsync();

            return id;
        }
        ///
        /// <summary>
        /// Add a root board to a parent board.
        /// <param name="parentId">Id of parent board</param>
        /// </summary>
        public async Task<string> AddAsync(Board entity, string groupId, string username)
        {
            string id = _generator.NewId(username);
            entity.Id = id;

            await Client.Cypher
                .Match("(:Board)-[:ChildGroup]->(previous:Group)-[oldRel:Next]->(next)")
                .Where((Group previous) => previous.Id == groupId)
                .Call("apoc.lock.nodes([previous])")
                .Create("(previous)-[:Next]->(board:Board {newBoard})-[:Next]->(next)")
                .WithParam("newBoard", entity)
                .Delete("oldRel")
                .ExecuteWithoutResultsAsync();

            return id;
        }

        public async Task EditAsync(Board newBoardContents)
        {
            await Client.Cypher
                .Match("(board:Board)")
                .Where("board.id = {id}")
                .WithParam("id", newBoardContents.Id)
                .Set("board = {newBoardContents}")
                .WithParam("newBoardContents", newBoardContents)
                .ExecuteWithoutResultsAsync();
        }

        public async Task DeleteAsync(string id)
        {
            await Client.Cypher
                .Match("(prev)-[prevRel:Next]->(board:Board)-[nextRel:Next]->(next)")
                .Where("board.id = {id}")
                .WithParam("id", id)
                .Call("apoc.lock.nodes([prev])")
                .Create("(prev)-[:Next]->(next)")
                .Delete("prevRel, nextRel, board")
                .ExecuteWithoutResultsAsync();
        }

        /// <summary>
        /// Add board groups
        /// </summary>
        public async Task<object> SetupAsync(string id)
        {
            IEnumerable<int> childrenCount = await Client.Cypher
                .Match("(board:Board)-[:ChildGroup]->(group:Group)")
                .Where((Board board) => board.Id == id)
                .Return<int>("count(group)")
                .ResultsAsync;
            bool isEmpty = childrenCount.First() == 0;

            if (isEmpty) return await AddDefaultGroups(id);
            else         throw new InvalidOperationException();
        }

        /// <summary>
        /// Move a board to under another board (or group)
        /// <param name="hostId">Id of the parent board</param>
        /// <param name="boardId">Id of board to move</param>
        /// <param name="targetId">Id of board to put it under</param>
        /// </summary>
        public async Task MoveAsync(string hostId, string boardId, string targetId, bool isRoot)
        {
            string whereHostId = "host.id = {hostId}";
            if (isRoot) whereHostId = "host.username = {hostId}"; // Username

            await Client.Cypher
                .Match("(host)")
                .Where(whereHostId)
                .WithParam("hostId", hostId)
                .Match("(previous)-[previousRel:Next]->(board:Board)-[nextRel:Next]->(next)")
                .Where((Board board) => board.Id == boardId)
                .Match("(newPrevious)-[rel:Next]->(newNext)")
                .Where("newPrevious.id = {targetId}")
                .WithParam("targetId", targetId)
                .Call("apoc.lock.nodes([host])")
                .Delete("previousRel, nextRel, rel")
                .Create("(previous)-[:Next]->(next)")
                .Create("(newPrevious)-[:Next]->(board)-[:Next]->(newNext)")
                .ExecuteWithoutResultsAsync();
        }

        /// <summary>
        /// Add a user to board for collaboration
        /// </summary>
        /// <param name="boardId">Id of the relevant board</param>
        /// <param name="username">Username of user to add</param>
        public async Task AddUserAsync(string boardId, string username)
        {
            await Client.Cypher
                .Match("(sharedBoard:Board)", "(user:User)-[:ChildGroup]->(previous)-[oldRel:Next]->(next)")
                .Where((User user) => user.Username == username)
                .AndWhere((Board sharedBoard) => sharedBoard.Id == boardId)
                .Call("apoc.lock.nodes([user])")
                .Create("(previous)-[:Next]->(link:Link)-[:Next]->(next)")
                .Delete("oldRel")
                .Create("(link)-[:SharedBoard]->(sharedBoard)")
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
                .Match("(user:User)-[:ChildGroup]->(:Group)-[:Next*]->(link:Link)-[sharedRel:SharedBoard]->(board:Board)")
                .Where((User user) => user.Username == username)
                .AndWhere((Board board) => board.Id == boardId)
                .Match("(previous)-[previousRel:Next]->(link)-[nextRel:Next]->(next)")
                .Call("apoc.lock.nodes([user])")
                .Delete("previousRel, nextRel, sharedRel, link")
                .Create("(previous)-[:Next]->(next)")
                .ExecuteWithoutResultsAsync();
        }

        /// <summary>
        /// Return the users the board is shared to (excluding the owner).
        /// </summary>
        /// <param name="boardId">Id of board that is being shared</param>
        public async Task<object> GetUsersAsync(string boardId)
        {
            return await Client.Cypher
                .Match("(board:Board)")
                .Where((Board board) => board.Id == boardId)
                .Match("(user:User)-[:ChildGroup]->(:Group)-[:Next]->(:Link)-[:SharedBoard]->(board)")
                .Return<string>("user.username")
                .ResultsAsync;
        }

        // This is all temporary ok
        private async Task<object> AddDefaultGroups(string id)
        {
            await Client.Cypher
                .Match("(board:Board)")
                .Where((Board board) => board.Id == id)
                .Create("(board)-[:ChildGroup { order: 0 }]->(:Group { name: 'Backlog', id: 'a' })-[:Next]->(:End)")
                .Create("(board)-[:ChildGroup { order: 1 }]->(:Group { name: 'Ready', id: 'b' })-[:Next]->(:End)")
                .Create("(board)-[:ChildGroup { order: 2 }]->(:Group { name: 'In Progress',  id: 'c' })-[:Next]->(:End)")
                .Create("(board)-[:ChildGroup { order: 3 }]->(:Group { name: 'Done', id: 'd' })-[:Next]->(:End)")
                .ExecuteWithoutResultsAsync();

            return await Client.Cypher
                .Match("(board:Board)-[:ChildGroup]->(group:Group)")
                .Where((Board board) => board.Id == id)
                .Return((group) => group.As<Group>())
                .ResultsAsync;
        }
    }
}
