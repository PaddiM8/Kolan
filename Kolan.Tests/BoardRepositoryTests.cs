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

namespace Kolan.Tests
{
    public class BoardRepositoryTest
    {
        private UnitOfWork _uow;
        private IGraphClient _graphClient;
        private Board _defaultBoard;
        private const string _username1 = "testUser1";
        private const string _username2 = "testUser2";

        [SetUp]
        public async Task Setup()
        {
            new Database().Setup();
            await new UserController(_uow).Create(_username1, "pass1");
            await new UserController(_uow).Create(_username2, "pass2");
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

            _defaultBoard = new Board
            {
                Name = "name",
                Description = "some description"
            };
        }

        [Test]
        public async Task Add_RootBoardWithName_ReturnsId()
        {
            string returnedId = await _uow.Boards.AddAsync(_defaultBoard, _username1);
            bool exists = await _uow.Boards.Exists(returnedId);

            // Assert
            Assert.That(returnedId, Is.Not.Null);
            Assert.That(exists, Is.True);
        }

        [Test]
        public async Task AddAndGet_BoardWithName_ReturnsEmptyBoardAndUserAccess()
        {
            // Act
            string returnedId = await _uow.Boards.AddAsync(_defaultBoard, _username1);
            dynamic returnedBoard = await _uow.Boards.GetAsync(returnedId, _username1);

            // Assert
            Assert.That(returnedBoard.Board.Name, Is.EqualTo(_defaultBoard.Name));
            Assert.That(returnedBoard.Board.Description, Is.EqualTo(_defaultBoard.Description));
            Assert.That(returnedBoard.Groups, Is.Null);
            Assert.That(returnedBoard.Ancestors, Is.Empty);
            Assert.That(returnedBoard.UserAccess, Is.EqualTo("true"));
        }

        [TestCase(_username2)]
        [TestCase("")]
        [TestCase("abc")]
        public async Task AddAndGet_BoardWithUnauthorizedUser_ReturnsUserAccessFalse(string unauthorizedUser)
        {
            // Act
            string returnedId = await _uow.Boards.AddAsync(_defaultBoard, _username1);
            dynamic returnedBoard = await _uow.Boards.GetAsync(returnedId, unauthorizedUser);

            // Assert
            Assert.That(returnedBoard.UserAccess, Is.EqualTo("false"));
        }

        [TestCase(_username2)]
        public async Task AddAndGetAll_BoardsIncludingSharedOnes_ReturnsListOfBoards(string username2)
        {
            // Act
            string boardId1 = await _uow.Boards.AddAsync(_defaultBoard, _username1);
            string boardId2 = await _uow.Boards.AddAsync(_defaultBoard, _username1);
            string boardId3 = await _uow.Boards.AddAsync(_defaultBoard, username2);
            await _uow.Boards.AddUserAsync(boardId3, _username1);

            List<Board> returnedBoards = (await _uow.Boards.GetAllAsync(_username1)).ToList();

            // Assert
            Assert.That(returnedBoards.Any(x => x.Id == boardId1 && !x.Shared), Is.True);
            Assert.That(returnedBoards.Any(x => x.Id == boardId2 && !x.Shared), Is.True);
            Assert.That(returnedBoards.Any(x => x.Id == boardId3 && x.Shared), Is.True);
        }

        [Test]
        public async Task Setup_EmptyBoard_ReturnsListOfGroups()
        {
            // Arrange
            string returnedId = await _uow.Boards.AddAsync(_defaultBoard, _username1);

            // Act
            IEnumerable<Group> returnedGroups = await _uow.Boards.SetupAsync(returnedId);

            // Assert
            Assert.That(returnedGroups.Count(), Is.GreaterThan(0));

            foreach (Group returnedGroup in returnedGroups)
            {
                Assert.That(returnedGroup.Id, Is.Not.Null);

                bool groupWasAdded = (await _graphClient.Cypher
                    .Match("(board:Board)-[:ChildGroup]->(group:Group)")
                    .Where((Board board) => board.Id == returnedId)
                    .AndWhere((Group group) => group.Id == returnedGroup.Id)
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
            IEnumerable<Group> groups = await _uow.Boards.SetupAsync(parentId);

            // Act
            foreach (Group parentGroup in groups)
            {
                string childId = await _uow.Boards.AddAsync(_defaultBoard, parentGroup.Id, _username1);

                // Assert
                bool childBoardRelExists = (await _graphClient.Cypher
                    .Match("(parent:Board)-[:ChildBoard]->(child:Board)")
                    .Where((Board parent) => parent.Id == parentId)
                    .AndWhere((Board child) => child.Id == childId)
                    .Return((child) => Return.As<int>("count(child)"))
                    .ResultsAsync)
                    .Single() == 1;

                bool wasAddedInLinkedList = (await _graphClient.Cypher
                    .Match("(parent:Board)-[:ChildGroup]->(group:Group)-[:Next*]->(child:Board)-[:Next*]->(:End)")
                    .Where((Board parent) => parent.Id == parentId)
                    .AndWhere((Board group) => group.Id == parentGroup.Id)
                    .AndWhere((Board child) => child.Id == childId)
                    .Return((child) => Return.As<int>("count(child)"))
                    .ResultsAsync)
                    .Single() == 1;

                Assert.That(childBoardRelExists, Is.True);
                Assert.That(wasAddedInLinkedList, Is.True);
            }
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
            var result = _graphClient.Cypher
                .Match("(user:User)-[:ChildGroup]->(:Group)-[:Next]->(board:Board)")
                .Where((User user) => user.Username == _username1)
                .AndWhere((Board board) => board.Id == boardId)
                .Return((board) => board.As<Board>().Id)
                .ResultsAsync;

            Assert.That(result.Result.Single(), Is.EqualTo(boardId));
        }

        [Test]
        public async Task Move_ChildBoardToTopOfGroup()
        {
            // Arrange
            string parentId = await _uow.Boards.AddAsync(_defaultBoard, _username1);
            string groupId = (await _uow.Boards.SetupAsync(parentId)).First().Id;

            await _uow.Boards.AddAsync(_defaultBoard, groupId, _username1);
            await _uow.Boards.AddAsync(_defaultBoard, groupId, _username1);
            string boardId = await _uow.Boards.AddAsync(_defaultBoard, groupId, _username1);

            // Act
            await _uow.Boards.MoveAsync(parentId, boardId, groupId, false);

            // Assert
            var result = _graphClient.Cypher
                .Match("(parent:Board)-[:ChildGroup]->(group:Group)-[:Next]->(board:Board)")
                .Where((Board parent) => parent.Id == parentId)
                .AndWhere((Group group) => group.Id == groupId)
                .AndWhere((Board board) => board.Id == boardId)
                .Return((board) => board.As<Board>().Id)
                .ResultsAsync;

            Assert.That(result.Result.Single(), Is.EqualTo(boardId));
        }

        [Test]
        public async Task AddUser_AsCollaboratorToBoard()
        {
            // Arrange
            string boardId = await _uow.Boards.AddAsync(_defaultBoard, _username1);
            await _uow.Boards.SetupAsync(boardId);

            // Act
            await _uow.Boards.AddUserAsync(boardId, _username2);

            // Assert
            bool addedCorrectly = (await _graphClient.Cypher
                .Match("(user1:User)-[:ChildBoard]->(board:Board)<-[:SharedBoard]-(link:Link)")
                .Where((User user1) => user1.Username == _username1)
                .AndWhere((Board board) => board.Id == boardId)
                .Match("(user2:User)-[:ChildGroup]->(:Group)-[:Next]->(link)")
                .Where((User user2) => user2.Username == _username2)
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
            await _uow.Boards.SetupAsync(boardId);

            // Act
            await _uow.Boards.RemoveUserAsync(boardId, _username2);

            // Assert
            bool removedCorrectly = (await _graphClient.Cypher
                .Match("(user2:User)-[:ChildBoard]->(:Link)-[:SharedBoard]->(board:Board)")
                .Where((User user2) => user2.Username == _username2)
                .AndWhere((Board board) => board.Id == boardId)
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
            dynamic boardContent = await _uow.Boards.GetAsync(nestedBoards.deepestChildId, _username1);
            List<Board> ancestors = boardContent.Ancestors;

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
            await _uow.Boards.SetupAsync(nestedBoards.deepestChildId);
            await _uow.Boards.AddUserAsync(nestedBoards.deepestChildId, _username2);

            // Act
            dynamic boardContent = await _uow.Boards.GetAsync(nestedBoards.deepestChildId, _username2);
            List<Board> ancestors = boardContent.Ancestors;

            // Assert
            Assert.That(ancestors, Is.Null);
        }

        private async Task<(string deepestChildId, string[] ancestorIds)> CreateNestedBoards()
        {
            // Add root board
            await _uow.Boards.AddAsync(_defaultBoard, _username1);
            string rootId = await _uow.Boards.AddAsync(_defaultBoard, _username1);
            await _uow.Boards.AddAsync(_defaultBoard, _username1);
            IEnumerable<Group> rootGroups = await _uow.Boards.SetupAsync(rootId);

            // Add a board in each group of the root board
            string rootChildId = "";
            int i = 0;
            foreach (Group rootGroup in rootGroups)
            {
                await _uow.Boards.AddAsync(_defaultBoard, rootGroup.Id, _username1);

                // Add two extra boards in one of them
                if (i == 1)
                {
                    rootChildId = await _uow.Boards.AddAsync(_defaultBoard, rootGroup.Id, _username1); // The chosen one
                    await _uow.Boards.AddAsync(_defaultBoard, rootGroup.Id, _username1);
                }

                i++;
            }

            // Add some boards in one of the root board's children
            string rootChildGroupId = (await _uow.Boards.SetupAsync(rootChildId)).First().Id;
            await _uow.Boards.AddAsync(_defaultBoard, rootChildGroupId, _username1);
            string deepestChildId = await _uow.Boards.AddAsync(_defaultBoard, rootChildGroupId, _username1);
            await _uow.Boards.AddAsync(_defaultBoard, rootChildGroupId, _username1);

            return (deepestChildId, new string[] { rootChildId, rootId });
        }
    }
}
