using System.Runtime.InteropServices;
using System.Runtime.Intrinsics.X86;
using System.Xml.Linq;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Neo4jClient;
using Neo4jClient.Cypher;
using Kolan.Models;
using System.Runtime.CompilerServices;
using Kolan.Enums;
using Newtonsoft.Json;

[assembly: InternalsVisibleTo("Kolan.Tests")]
namespace Kolan.Repositories
{
    public class BoardRepository : Repository<Task>
    {
        private readonly Generator _generator;

        public BoardRepository(IGraphClient client)
            : base(client)
        {
            _generator = new Generator();
        }

        /// <summary>
        /// Return all the root boards of a user.
        /// <param name="username">User to get the boards from.</param>
        /// </summary>
        public async Task<dynamic> GetAllAsync(string username)
        {
            username = username.ToLower();

            var result = (await Client.Cypher
                .Match("(user:User)-[:CHILD_GROUP]->(rootGroup:Group)")
                .Where((User user) => user.Username == username)
                .OptionalMatch("(rootGroup)-[:NEXT*]->(boardOrLink)-[:NEXT*]->(:End)")
                .OptionalMatch("(boardOrLink)-[:SHARED_BOARD]->(sharedBoard)")
                .Return((user, boardOrLink, sharedBoard) => new
                {
                    BoardsAndLinks = boardOrLink.CollectAs<BoardTask>(),
                    SharedBoards = sharedBoard.CollectAs<BoardTask>(),
                    User = user.As<User>()
                })
                .ResultsAsync)
                .FirstOrDefault();

            // Merge the shared boards into the main boards list
            var boardsAndLinks = result.BoardsAndLinks.ToArray();
            var sharedBoards = new Queue<BoardTask>(result.SharedBoards);

            for (int i = 0; i < boardsAndLinks.Count(); i++)
            {
                // If it has no id, it's a Link node
                if (boardsAndLinks[i].Id == null) 
                {
                    var sharedBoard = sharedBoards.Dequeue();
                    sharedBoard.EncryptionKey = boardsAndLinks[i].EncryptionKey;
                    boardsAndLinks[i] = sharedBoard;
                }
            }

            return new
            {
                Boards = boardsAndLinks,
                Keys = new
                {
                    result.User.PublicKey,
                    result.User.PrivateKey
                }
            };
        }

        /// <summary>
        /// Return the groups and boards from a parent board.
        /// </summary>
        /// <param name="id">Board id</param>
        /// <param name="username">User requesting the board data</param>
        public async Task<Board> GetAsync(string id, string username)
        {
            if (username != null) username = username.ToLower();

            return (await Client.Cypher
                .Match("(board:Board)")
                .Where((BoardTask board) => board.Id == id)

                // Get the groups and the boards under them
                .OptionalMatch("(board)-[groupRel:CHILD_GROUP]->(g:Group)")
                .OptionalMatch("(g)-[:NEXT*]->(childBoard:Board)-[:NEXT*]->(:End)")
                .With("groupRel, board, {groupNode: g, tasks: collect(childBoard)} AS group")
                .OrderBy("groupRel.order")

                // Get the path from the board to the user. This makes it possible to check if the user owns the board
                .OptionalMatch("path=(board)<-[:CHILD_BOARD*0..]-(rootBoard)<-[childBoardRel:CHILD_BOARD]-(user:User)")
                .Where((User user) => user.Username == username)
                .With("user, board, group, path, rootBoard, childBoardRel")

                // Find out if it's a shared board
                .OptionalMatch("sharedPath=(rootBoard)<-[:SHARED_BOARD]-(link)<-[:NEXT*0..]-()<-[:CHILD_GROUP]-(user)")

                // Get the right encryption key for the user
                .With(@"*, CASE WHEN path IS NULL
                               THEN NULL
                               ELSE CASE WHEN sharedPath IS NOT NULL THEN link.encryptionKey ELSE rootBoard.encryptionKey END
                           END AS encryptionKey")

                // Build the board object
                .With(@"{
                    content: board { .*, encryptionKey: encryptionKey },
                    groups: CASE WHEN group.groupNode IS NULL THEN NULL ELSE collect(group) END,
                    ancestors: tail([b in nodes(path) WHERE (b:Board) | { id: b.id, name: b.name }]),
                    userAccess: CASE WHEN path IS NULL
                                    THEN CASE WHEN board.public = false THEN 0 ELSE 1 END
                                    ELSE CASE WHEN sharedPath IS NOT NULL THEN 2 ELSE 3 END
                                END
                } AS boardMap")
                .Return((boardMap) => boardMap.As<Board>())
                .ResultsAsync)
                .SingleOrDefault();
        }

        /// <summary>
        /// Checks if a user has access to a board.
        /// </summary>
        /// <param name="boardId">Id of the board</param>
        /// <param name="username">Username of the user to check for permission for</param>
        public async Task<PermissionLevel> GetUserPermissionLevel(string boardId, string username)
        {
            if (username != null) username = username.ToLower();

            var result = await Client.Cypher
                .Match("(board:Board)")
                .Where((BoardTask board) => board.Id == boardId)
                .OptionalMatch("path=(board)<-[:CHILD_BOARD*0..]-(rootBoard)<-[:CHILD_BOARD]-(user:User)")
                .Where((User user) => user.Username == username)
                .With("path, user, board, rootBoard")
                .OptionalMatch("sharedPath=(rootBoard)<-[:SHARED_BOARD]-()<-[:NEXT*0..]-()<-[:CHILD_GROUP]-(user)")
                .Return((path, board, sharedPath) =>
                        Return.As<PermissionLevel>(@"CASE WHEN path IS NULL
                                                     THEN CASE WHEN board.public = false THEN 0 ELSE 1 END
                                                     ELSE CASE WHEN sharedPath IS NOT NULL THEN 2 ELSE 3 END
                                                     END"))
                .ResultsAsync;

            return result.SingleOrDefault();
        }

        /// <summary>
        /// Add a root board to a user.
        /// </summary>
        /// <remarks>
        /// Board gets added at the start.
        /// </remarks>
        /// <param name="board">Board object</param>
        /// <param name="username">User to add it to.</param>
        public async Task<string> AddAsync(BoardTask board, string username)
        {
            username = username.ToLower();
            string id = _generator.NewId(username);
            board.Id = id;

            await Client.Cypher
                .Match("(user:User)")
                .Where((User user) => user.Username == username)
                .Call("apoc.lock.nodes([user])")
                .Match("(user)-[:CHILD_GROUP]->(previous)-[oldRel:NEXT]->(next)")
                .Create("(previous)-[:NEXT]->(board:Board {newBoard})-[:NEXT]->(next)")
                .WithParam("newBoard", board)
                .Create("(user)-[childBoardRel:CHILD_BOARD]->(board)")
                .Set("childBoardRel.shared = false")
                .Delete("oldRel")
                .With("user")
                .Set("user.boardCount = user.boardCount + 1")
                .ExecuteWithoutResultsAsync();

            return id;
        }

        /// <summary>
        /// Add a board to a parent board.
        /// </summary>
        /// <remarks>
        /// Board gets added at the end.
        /// </remarks>
        /// <param name="board">Board object</param>
        /// <param name="groupId">Id of group to add it to</param>
        /// <param name="username">Username of the owner</param>
        public async Task<string> AddAsync(BoardTask board, string groupId, string username)
        {
            username = username.ToLower();
            string id = _generator.NewId(username);
            board.Id = id;

            await Client.Cypher
                .Match("(parent:Board)-[:CHILD_GROUP]->(group:Group)")
                .Where((GroupNode group) => group.Id == groupId)
                .Call("apoc.lock.nodes([group])")
                .Match("(group)-[:NEXT*]->(next:End)")
                .Match("(previous)-[oldRel:NEXT]->(next)")
                .Create("(previous)-[:NEXT]->(board:Board {newBoard})-[:NEXT]->(next)")
                .WithParam("newBoard", board)
                .Create("(parent)-[:CHILD_BOARD]->(board)")
                .Set("board.encrypted = parent.encrypted")
                .Delete("oldRel")
                .ExecuteWithoutResultsAsync();

            return id;
        }

        /// <summary>
        /// Edit a board
        /// </summary>
        /// <param name="newBoardContents">The new contents of the board</param>
        public async Task EditAsync(BoardTask newBoardContents)
        {
            await Client.Cypher
                .Match("(board:Board)")
                .Where("board.id = {id}")
                .WithParam("id", newBoardContents.Id)
                .With("board, {newBoardContents} AS newBoard")
                .WithParam("newBoardContents", newBoardContents)
                .Set("board = newBoard { .*, encrypted: board.encrypted }")
                .ExecuteWithoutResultsAsync();
        }

        /// <summary>
        /// Change the publicity of a board
        /// </summary>
        /// <param name="boardId">Id of the board</param>
        /// <param name="publicity">Whether or not it should be public</param>
        public async Task SetPublicityAsync(string boardId, bool publicity)
        {
            await Client.Cypher
                .Match("(board:Board)")
                .Where("board.id = {id}")
                .WithParam("id", boardId)
                .Set("board.public = CASE WHEN board.encrypted = false THEN {publicity} ELSE false END")
                .WithParam("publicity", publicity)
                .ExecuteWithoutResultsAsync();
        }

        /// <summary>
        /// Change the order of groups in a board
        /// </summary>
        /// <param name="boardId">Parent board</param>
        /// <param name="groupIds">List of the group ids in the correct order</param>
        public async Task SetGroupOrder(string boardId, string[] groupIds)
        {
            await Client.Cypher
                .With("{groupIds} AS groupIds")
                .WithParam("groupIds", groupIds)
                .Unwind("range(0, size(groupIds) - 1)", "index")
                .Match("(board:Board)-[rel:CHILD_GROUP]->(group:Group)")
                .Where((BoardTask board) => board.Id == boardId)
                .AndWhere("group.id = groupIds[index]")
                .Set("rel.order = index")
                .Return<string[]>("groupIds")
                .ExecuteWithoutResultsAsync();
        }

        /// <summary>
        /// Whether or not a board exists
        /// </summary>
        /// <param name="id">Board id</param>
        public async Task<bool> ExistsAsync(string id)
        {
            var result = await Client.Cypher
                .Match("(board:Board)")
                .Where("board.id = {id}")
                .WithParam("id", id)
                .Return((board) => Return.As<int>("count(board)"))
                .ResultsAsync;

            return result.Single() > 0;
        }

        /// <summary>
        /// Delete any board
        /// </summary>
        /// <param name="id">Board id</param>
        public async Task DeleteAsync(string id)
        {
            await Client.Cypher
                .Match("(prev)-[prevRel:NEXT]->(board:Board)")
                .Where("board.id = {id}")
                .WithParam("id", id)
                .Call("apoc.lock.nodes([prev])")

                // Remove the node from the linked list
                .Match("(board)-[nextRel:NEXT]->(next)")
                .Create("(prev)-[:NEXT]->(next)")
                .Delete("prevRel, nextRel")
                .With("board")

                // Remove all the collaborators
                .Call("apoc.path.subgraphNodes(board, {labelFilter: '/Link', relationshipFilter: 'CHILD_BOARD>|CHILD_GROUP>|NEXT>|<SHARED_BOARD'})")
                .Yield("node")
                .Match("(prev)-[prevRel:NEXT]->(node)-[nextRel:NEXT]->(next)")
                .DetachDelete("node")
                .Create("(prev)-[:NEXT]->(next)")
                .With("board")

                // Remove all the nodes under the board
                .Call("apoc.path.subgraphNodes(board, {relationshipFilter: 'CHILD_BOARD>|CHILD_GROUP>|NEXT>'})")
                .Yield("node")
                .DetachDelete("node")
                .With("board")

                // Remove the board node itself
                .Match("()-[childRel:CHILD_BOARD|SHARED_BOARD]->(board)")
                .Delete("childRel, board")
                .ExecuteWithoutResultsAsync();
        }

        /// <summary>
        /// Add board groups
        /// </summary>
        /// <param name="id">Board id</param>
        /// <param name="groupNames">List of names of groups to initialise the board with</param>
        public async Task<string[]> SetupAsync(string id, string[] groupNames)
        {
            // Inherit parents groups
            if (groupNames.Length == 0)
            {
                groupNames = (await Client.Cypher
                    .Match("(parent:Board)-[:CHILD_BOARD]->(board:Board)")
                    .Where((BoardTask board) => board.Id == id)
                    .Match("(parent)-[rel:CHILD_GROUP]->(group:Group)")
                    .Return<string>("group.name")
                    .OrderBy("rel.order")
                    .ResultsAsync)
                    .ToArray();
            }

            // Create group objects with randomly generated ids
            var groups = new List<GroupNode>(groupNames.Length);
            for (int i = 0; i < groupNames.Length; i++)
            {
                groups.Add(new GroupNode
                {
                    Id = _generator.NewId(id + i.ToString()),
                    Name = groupNames[i]
                });
            }

            // Add list of groups
            await Client.Cypher
                .Match("(board:Board)")
                .Where((BoardTask board) => board.Id == id)
                .OptionalMatch("(parent:Board)-[:CHILD_BOARD]->(board)")
                .Set("board.public = CASE WHEN parent IS NULL THEN false ELSE parent.public END")
                .With("board, {groups} as groups")
                .WithParam("groups", groups)
                .Unwind("range(0, size(groups) - 1)", "index")
                .Create("(board)-[:CHILD_GROUP { order: index }]->(g:Group)-[:NEXT]->(:End)")
                .Set("g = groups[index]")
                .ExecuteWithoutResultsAsync();

            return groupNames;
        }

        /// <summary>
        /// Move a board to under another board (or group)
        /// <param name="hostId">Id of the parent board</param>
        /// <param name="boardId">Id of board to move</param>
        /// <param name="targetId">Id of board to put it under</param>
        /// <param name="isRoot">Whether or not the board is a root board</param>
        /// </summary>
        public async Task MoveAsync(string hostId, string boardId, string targetId, bool isRoot)
        {
            if (isRoot ) hostId = hostId.ToLower();

            await Client.Cypher
                .Match("(host)")
                .Where(isRoot ? "host.username = {hostId}" : "host.id = {hostId}")
                .WithParam("hostId", hostId)
                .Call("apoc.lock.nodes([host])")
                .Match("(previous)-[previousRel:NEXT]->(board:Board)-[nextRel:NEXT]->(next)")
                .Where((BoardTask board) => board.Id == boardId)
                .AndWhere((BoardTask previous) => previous.Id != targetId)
                .Match("(host)-[:CHILD_GROUP]->()-[:NEXT*0..]->(newPrevious)-[rel:NEXT]->(newNext)")
                .Where("newPrevious.id = {targetId}")
                .WithParam("targetId", targetId)
                .Delete("previousRel, nextRel, rel")
                .Create("(previous)-[:NEXT]->(next)")
                .Create("(newPrevious)-[:NEXT]->(board)-[:NEXT]->(newNext)")
                .ExecuteWithoutResultsAsync();
        }

        /// <summary>
        /// Add a user to board for collaboration
        /// </summary>
        /// <param name="boardId">Id of the relevant board</param>
        /// <param name="username">Username of user to add</param>
        /// <param name="encryptionKey">(This should be encrypted) Encryption key used to encrypt and decrypt the board.</param>
        public async Task<bool> AddUserAsync(string boardId, string username, string encryptionKey = null)
        {
            username = username.ToLower();

            // Don't add user if it already has access to the board
            if (await GetUserPermissionLevel(boardId, username) >= PermissionLevel.Edit) return false;

            var result = await Client.Cypher
                .Match("(user:User)")
                .Where((User user) => user.Username == username)
                .Call("apoc.lock.nodes([user])")
                .Match("(sharedBoard:Board)", "(user)-[:CHILD_GROUP]->(previous)-[oldRel:NEXT]->(next)")
                .Where((BoardTask sharedBoard) => sharedBoard.Id == boardId)
                .Create("(previous)-[:NEXT]->(link:Link)-[:NEXT]->(next)")
                .Create("(user)-[childBoardRel:CHILD_BOARD]->(sharedBoard)")
                .Set("childBoardRel.shared = true")
                .Set("link.encryptionKey = {encryptionKey}")
                .WithParam("encryptionKey", encryptionKey)
                .Delete("oldRel")
                .Create("(link)-[:SHARED_BOARD]->(sharedBoard)")
                .Return((user) => user.As<User>().Username)
                .ResultsAsync;

            return result.Count() == 1; // If no users were found, return false. // TODO: Exception?
        }

        /// <summary>
        /// Remove a user from being able to edit the board
        /// </summary>
        /// <param name="boardId">Id of the relevant board</param>
        /// <param name="username">Username of user to remove</param>
        public async Task RemoveUserAsync(string boardId, string username)
        {
            username = username.ToLower();

            await Client.Cypher
                .Match("(user:User)")
                .Where((User user) => user.Username == username)
                .Call("apoc.lock.nodes([user])")
                .Match("(user)-[:CHILD_GROUP]->()-[:NEXT*]->(link:Link)-[sharedRel:SHARED_BOARD]->(board:Board)",
                       "(user)-[childBoardRel:CHILD_BOARD]->(board)")
                .Where((BoardTask board) => board.Id == boardId)
                .Match("(previous)-[previousRel:NEXT]->(link)-[nextRel:NEXT]->(next)")
                .Delete("previousRel, nextRel, sharedRel, link, childBoardRel")
                .Create("(previous)-[:NEXT]->(next)")
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
                .Where((BoardTask board) => board.Id == boardId)
                .Match("(user:User)-[:CHILD_GROUP]->(:Group)-[:NEXT]->(:Link)-[:SHARED_BOARD]->(board)")
                .Return<string>("user.displayName")
                .ResultsAsync;
        }
    }
}
