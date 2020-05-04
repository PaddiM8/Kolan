using NUnit.Framework;
using Kolan.Repositories;
using Kolan.Controllers.Api;
using System.Threading.Tasks;
using Kolan.Models;
using Neo4jClient;
using Neo4jClient.Cypher;
using System.Collections.Generic;
using System.Linq;
using System;
using Newtonsoft.Json;
using Kolan.Enums;

namespace Kolan.Tests
{
    public class BoardRepositoryTest
    {
        private UnitOfWork _uow;
        private IGraphClient _graphClient;
        private BoardTask _defaultBoard;
        private const string _username1 = "testUser1";
        private const string _username2 = "testUser2";
        private static readonly string[] _defaultGroups = { "group1", "group2", "group3" };

        [SetUp]
        public async Task Setup()
        {
            new Database().Setup();
            await new UsersController(_uow).Create(new ViewModels.RegisterViewModel
            {
                Email = "test1@test.test",
                Username = _username1,
                Password = "pass1",
                RepeatPassword = "pass1"
            });

            await new UsersController(_uow).Create(new ViewModels.RegisterViewModel
            {
                Email = "test2@test.test",
                Username = _username2,
                Password = "pass2",
                RepeatPassword = "pass2"
            });
        }

        [TearDown]
        public async Task TearDown()
        {
            await _graphClient.Cypher
                .Match("(n)")
                .DetachDelete("n")
                .ExecuteWithoutResultsAsync();
        }

        [OneTimeSetUp]
        public void SetupTests()
        {
            Config.Load("../../../../server-config.json");
            new Database().Init();
            _graphClient = Database.Client;
            _uow = new UnitOfWork(_graphClient);

            _defaultBoard = new BoardTask
            {
                Name = "name",
                Description = "some description"
            };
        }

        [Test]
        public async Task Add_RootBoardWithName_ReturnsId()
        {
            string returnedId = await _uow.Boards.AddAsync(_defaultBoard, _username1);
            bool exists = await _uow.Boards.ExistsAsync(returnedId);

            // Assert
            Assert.That(returnedId, Is.Not.Null);
            Assert.That(exists, Is.True);
        }

        [Test]
        public async Task AddAndGet_BoardWithName_ReturnsEmptyBoardAndUserAccess()
        {
            // Act
            string returnedId = await _uow.Boards.AddAsync(_defaultBoard, _username1);
            Board returnedBoard = await _uow.Boards.GetAsync(returnedId, _username1);

            // Assert
            Assert.That(returnedBoard.Content.Name, Is.EqualTo(_defaultBoard.Name));
            Assert.That(returnedBoard.Content.Description, Is.EqualTo(_defaultBoard.Description));
            Assert.That(returnedBoard.Groups, Is.Null);
            Assert.That(returnedBoard.Ancestors, Is.Empty);
            Assert.That(returnedBoard.UserAccess, Is.EqualTo(PermissionLevel.All));
        }

        [TestCase(_username2)]
        [TestCase("")]
        [TestCase("abc")]
        public async Task AddAndGet_BoardWithUnauthorizedUser_ReturnsUserAccessFalse(string unauthorizedUser)
        {
            // Act
            string returnedId = await _uow.Boards.AddAsync(_defaultBoard, _username1);
            Board returnedBoard = await _uow.Boards.GetAsync(returnedId, unauthorizedUser);

            // Assert
            Assert.That(returnedBoard.UserAccess, Is.EqualTo(PermissionLevel.None));
        }

        [TestCase(_username2)]
        public async Task AddAndGetAll_BoardsIncludingSharedOnes_ReturnsListOfBoards(string username2)
        {
            // Act
            string boardId1 = await _uow.Boards.AddAsync(_defaultBoard, _username1);
            string boardId2 = await _uow.Boards.AddAsync(_defaultBoard, _username1);
            string boardId3 = await _uow.Boards.AddAsync(_defaultBoard, username2);
            await _uow.Boards.AddUserAsync(boardId3, _username1);

            BoardTask[] returnedBoards = (await _uow.Boards.GetAllAsync(_username1)).Boards;

            // Assert
            Assert.That(returnedBoards.Any(x => x.Id == boardId1), Is.True);
            Assert.That(returnedBoards.Any(x => x.Id == boardId2), Is.True);
            Assert.That(returnedBoards.Any(x => x.Id == boardId3), Is.True);
        }

        [Test]
        public async Task Setup_EmptyBoard_ReturnsListOfGroups()
        {
            // Arrange
            string returnedId = await _uow.Boards.AddAsync(_defaultBoard, _username1);

            // Act
            string[] returnedGroups = await _uow.Boards.SetupAsync(returnedId, _defaultGroups);

            // Assert
            Assert.That(returnedGroups.Count(), Is.GreaterThan(0));

            for (int i = 0; i < returnedGroups.Length; i++)
            {
                string groupName = returnedGroups[i];
                Assert.That(groupName, Is.EqualTo(_defaultGroups[i]));

                bool groupWasAdded = (await _graphClient.Cypher
                    .Match("(board:Board)-[:CHILD_GROUP]->(group:Group)")
                    .Where((BoardTask board) => board.Id == returnedId)
                    .AndWhere((GroupNode group) => group.Name == groupName)
                    .Return((group) => Return.As<int>("count(group)"))
                    .ResultsAsync)
                    .Single() == 1;

                Assert.That(groupWasAdded, Is.True);
            }
        }

        [Test]
        public async Task Add_ChildBoardAfterGroup_ReturnsBoardId()
        {
            // Arrange
            string parentId = await _uow.Boards.AddAsync(_defaultBoard, _username1);
            string[] groups = await _uow.Boards.SetupAsync(parentId, _defaultGroups);

            // Act
            foreach (string groupName in groups)
            {
                string groupId = (await _graphClient.Cypher
                    .Match("(parent:Board)-[:CHILD_GROUP]->(group:Group)")
                    .Where((BoardTask parent) => parent.Id == parentId)
                    .AndWhere((GroupNode group) => group.Name == groupName)
                    .Return<string>("group.id")
                    .ResultsAsync)
                    .First();

                string childId = await _uow.Boards.AddAsync(_defaultBoard, groupId, _username1);

                // Assert
                bool childBoardRelExists = (await _graphClient.Cypher
                    .Match("(parent:Board)-[:CHILD_BOARD]->(child:Board)")
                    .Where((BoardTask parent) => parent.Id == parentId)
                    .AndWhere((BoardTask child) => child.Id == childId)
                    .Return((child) => Return.As<int>("count(child)"))
                    .ResultsAsync)
                    .Single() == 1;

                bool wasAddedInLinkedList = (await _graphClient.Cypher
                    .Match("(parent:Board)-[:CHILD_GROUP]->(group:Group)-[:NEXT*]->(child:Board)-[:NEXT*]->(:End)")
                    .Where((BoardTask parent) => parent.Id == parentId)
                    .AndWhere((BoardTask group) => group.Name == groupName)
                    .AndWhere((BoardTask child) => child.Id == childId)
                    .Return((child) => Return.As<int>("count(child)"))
                    .ResultsAsync)
                    .Single() == 1;

                Assert.That(childBoardRelExists, Is.True);
                Assert.That(wasAddedInLinkedList, Is.True);
            }
        }

        [Test]
        public async Task Delete_SharedChildBoard()
        {
            // Arrange
            (string deepestChildId, string[] ancestorIds) nestedBoards = await CreateNestedBoards();
            string boardId = nestedBoards.ancestorIds[0];
            await _uow.Boards.AddUserAsync(boardId, _username2.ToLower());

            int initialCount = (await _graphClient.Cypher
                    .Match("(board:Board)")
                    .Return<int>("count(board)")
                    .ResultsAsync)
                    .First();

            int amountToBeDeleted = (await _graphClient.Cypher
                .Match("(board:Board)-[:CHILD_BOARD]->(child:Board)")
                .Where((BoardTask board) => board.Id == boardId)
                .Return<int>("count(child) + 1")
                .ResultsAsync)
                .First();

            // Act
            await _uow.Boards.DeleteAsync(boardId);

            bool deletedProperly = (await _graphClient.Cypher
                .Match("(board:Board)")
                .Return<int>("count(board)")
                .ResultsAsync)
                .First() == initialCount - amountToBeDeleted;

            bool deletedFromCollaboratorProperly = (await _graphClient.Cypher
                .Match("(user:User)-[:CHILD_GROUP]->(:Group)-[:NEXT]->(:End)")
                .Where("user.username = {username}")
                .WithParam("username", _username2.ToLower())
                .Return<int>("count(user)")
                .ResultsAsync)
                .First() == 1;

            // Assert
            Assert.That(deletedProperly, Is.True);
            Assert.That(deletedFromCollaboratorProperly, Is.True);
        }

        [Test]
        public async Task Move_RootBoardToTop()
        {
            // Arrange
            await _uow.Boards.AddAsync(_defaultBoard, _username1);
            await _uow.Boards.AddAsync(_defaultBoard, _username1);
            string boardId = await _uow.Boards.AddAsync(_defaultBoard, _username1);

            // Act
            await _uow.Boards.MoveAsync(_username1, boardId, _username1, true);

            // Assert
            var result = await _graphClient.Cypher
                .Match("(user:User)-[:CHILD_GROUP]->(:Group)-[:NEXT]->(board:Board)")
                .Where("user.username = {username}")
                .WithParam("username", _username1.ToLower())
                .AndWhere((BoardTask board) => board.Id == boardId)
                .Return((board) => board.As<BoardTask>().Id)
                .ResultsAsync;

            Assert.That(result.Single(), Is.EqualTo(boardId));
        }

        [Test]
        public async Task Move_ChildBoardToTopOfGroup()
        {
            // Arrange
            string parentId = await _uow.Boards.AddAsync(_defaultBoard, _username1);
            string groupName = (await _uow.Boards.SetupAsync(parentId, _defaultGroups)).First();
            string groupId = (await _graphClient.Cypher
                .Match("(group:Group)")
                .Where((GroupNode group) => group.Name == groupName)
                .Return<string>("group.id")
                .ResultsAsync)
                .First();

            await _uow.Boards.AddAsync(_defaultBoard, groupId, _username1);
            await _uow.Boards.AddAsync(_defaultBoard, groupId, _username1);
            string boardId = await _uow.Boards.AddAsync(_defaultBoard, groupId, _username1);

            // Act
            await _uow.Boards.MoveAsync(parentId, boardId, groupId, false);

            // Assert
            var result = _graphClient.Cypher
                .Match("(parent:Board)-[:CHILD_GROUP]->(group:Group)-[:NEXT]->(board:Board)")
                .Where((BoardTask parent) => parent.Id == parentId)
                .AndWhere((BoardTask board) => board.Id == boardId)
                .Return((board) => board.As<BoardTask>().Id)
                .ResultsAsync;

            Assert.That(result.Result.Single(), Is.EqualTo(boardId));
        }

        [Test]
        public async Task AddUser_AsCollaboratorToBoard()
        {
            // Arrange
            string boardId = await _uow.Boards.AddAsync(_defaultBoard, _username1);
            await _uow.Boards.SetupAsync(boardId, _defaultGroups);

            // Act
            await _uow.Boards.AddUserAsync(boardId, _username2);

            // Assert
            bool addedCorrectly = (await _graphClient.Cypher
                .Match("(user1:User)-[:CHILD_BOARD]->(board:Board)<-[:SHARED_BOARD]-(link:Link)")
                .Where("user1.username = {username1}")
                .WithParam("username1", _username1.ToLower())
                .AndWhere((BoardTask board) => board.Id == boardId)
                .Match("(user2:User)-[:CHILD_GROUP]->(:Group)-[:NEXT]->(link)")
                .Where("user2.username = {username2}")
                .WithParam("username2", _username2.ToLower())
                .Return((board) => Return.As<int>("count(board)"))
                .ResultsAsync)
                .Single() == 1;

            Assert.That(addedCorrectly, Is.True);
        }

        [Test]
        public async Task RemoveUser_AsCollaboratorFromBoard()
        {
            // Arrange
            string boardId = await _uow.Boards.AddAsync(_defaultBoard, _username1);
            await _uow.Boards.SetupAsync(boardId, _defaultGroups);

            // Act
            await _uow.Boards.RemoveUserAsync(boardId, _username2);

            // Assert
            bool removedCorrectly = (await _graphClient.Cypher
                .Match("(user2:User)-[:CHILD_BOARD]->(:Link)-[:SHARED_BOARD]->(board:Board)")
                .Where((User user2) => user2.Username == _username2)
                .AndWhere((BoardTask board) => board.Id == boardId)
                .Return((board) => Return.As<int>("count(board)"))
                .ResultsAsync)
                .Single() == 0;

            Assert.That(removedCorrectly, Is.True);
        }

        [Test]
        public async Task Get_AncestorsOfBoard_ReturnsListOfBoards()
        {
            // Arrange
            var nestedBoards = await CreateNestedBoards();

            // Act
            Board boardContent = await _uow.Boards.GetAsync(nestedBoards.deepestChildId, _username1);
            Ancestor[] ancestors = boardContent.Ancestors.ToArray();

            // Assert
            Assert.That(ancestors[0].Id, Is.EqualTo(nestedBoards.ancestorIds[0]));
            Assert.That(ancestors[1].Id, Is.EqualTo(nestedBoards.ancestorIds[1]));
            Assert.That(ancestors.Count(), Is.EqualTo(2));
        }

        [Test]
        public async Task Get_AncestorsOfSharedBoard_ReturnsListOfBoards()
        {
            // Arrange
            var nestedBoards = await CreateNestedBoards();
            await _uow.Boards.SetupAsync(nestedBoards.deepestChildId, _defaultGroups);
            await _uow.Boards.AddUserAsync(nestedBoards.deepestChildId, _username2);

            // Act
            Board boardContent = await _uow.Boards.GetAsync(nestedBoards.deepestChildId, _username2);
            var ancestors = boardContent.Ancestors;

            // Assert
            Assert.That(ancestors, Is.Empty);
        }

        private async Task<(string deepestChildId, string[] ancestorIds)> CreateNestedBoards()
        {
            // Add root board
            await _uow.Boards.AddAsync(_defaultBoard, _username1);
            string rootId = await _uow.Boards.AddAsync(_defaultBoard, _username1);
            await _uow.Boards.AddAsync(_defaultBoard, _username1);
            string[] rootGroups = await _uow.Boards.SetupAsync(rootId, _defaultGroups);

            // Add a board in each group of the root board
            string rootChildId = "";
            int i = 0;
            foreach (string groupName in rootGroups)
            {
                string groupId = (await _graphClient.Cypher
                    .Match("(group:Group)")
                    .Where((GroupNode group) => group.Name == groupName)
                    .Return<string>("group.id")
                    .ResultsAsync)
                    .First();

                await _uow.Boards.AddAsync(_defaultBoard, groupId, _username1);

                // Add two extra boards in one of them
                if (i == 1)
                {
                    rootChildId = await _uow.Boards.AddAsync(_defaultBoard, groupId, _username1); // The chosen one
                    await _uow.Boards.AddAsync(_defaultBoard, groupId, _username1);
                }

                i++;
            }

            // Add some boards in one of the root board's children
            string rootChildGroupName = (await _uow.Boards.SetupAsync(rootChildId, _defaultGroups)).First();
            string rootChildGroupId = (await _graphClient.Cypher
                .Match("(board:Board)-[:CHILD_GROUP]->(group:Group)")
                .Where((BoardTask board) => board.Id == rootChildId)
                .AndWhere((GroupNode group) => group.Name == rootChildGroupName)
                .Return<string>("group.id")
                .ResultsAsync)
                .First();

            await _uow.Boards.AddAsync(_defaultBoard, rootChildGroupId, _username1);
            string deepestChildId = await _uow.Boards.AddAsync(_defaultBoard, rootChildGroupId, _username1);
            await _uow.Boards.AddAsync(_defaultBoard, rootChildGroupId, _username1);

            await _uow.Boards.SetupAsync(deepestChildId, _defaultGroups);

            return (deepestChildId, new string[] { rootChildId, rootId });
        }
    }
}
