using NUnit.Framework;
using Kolan.Repositories;
using Kolan.Controllers.Api;
using System.Threading.Tasks;
using Kolan.Models;
using Neo4jClient;
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

        [SetUp]
        public async Task Setup()
        {
            new Database().Setup();
            await new UserController(_uow).Create("testUser1", "pass1");
            await new UserController(_uow).Create("testUser2", "pass2");
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
        }

        [TestCase("testUser1", "board", "some description")]
        [TestCase("testUser1", "board", "")]
        public async Task Add_RootBoardWithName_ReturnsId(string username, string name, string description)
        {
            // Arrange
            var board = new Board
            {
                Name = name,
                Description = description
            };

            // Act
            string returnedId = await _uow.Boards.AddAsync(board, username);
            bool exists = await _uow.Boards.Exists(returnedId);

            // Assert
            Assert.That(returnedId, Is.Not.Null);
            Assert.That(exists, Is.True);
        }

        [TestCase("testUser1", "board", "some description")]
        [TestCase("testUser1", "board", "")]
        public async Task AddAndGet_BoardWithName_ReturnsEmptyBoardAndUserAccess(string username, string name, string description)
        {
            // Arrange
            var board = new Board
            {
                Name = name,
                Description = description
            };

            // Act
            string returnedId = await _uow.Boards.AddAsync(board, username);
            dynamic returnedBoard = await _uow.Boards.GetAsync(returnedId, username);

            // Assert
            Assert.That(returnedBoard.Board.Name, Is.EqualTo(name));
            Assert.That(returnedBoard.Board.Description, Is.EqualTo(description));
            Assert.That(returnedBoard.Groups, Is.Null);
            Assert.That(returnedBoard.Ancestors, Is.Empty);
            Assert.That(returnedBoard.UserAccess, Is.EqualTo("true"));
        }

        [TestCase("testUser1", "board", "some description", "testUser2")]
        [TestCase("testUser1", "board", "some description", "")]
        [TestCase("testUser1", "board", "some description", "abc")]
        public async Task AddAndGet_BoardWithUnauthorizedUser_ReturnsUserAccessFalse(string username, string name, string description, string unauthorizedUser)
        {
            // Arrange
            var board = new Board
            {
                Name = name,
                Description = description
            };

            // Act
            string returnedId = await _uow.Boards.AddAsync(board, username);
            dynamic returnedBoard = await _uow.Boards.GetAsync(returnedId, unauthorizedUser);

            // Assert
            Assert.That(returnedBoard.UserAccess, Is.EqualTo("false"));
        }

        [TestCase("testUser1", "testUser2", "board", "some description")]
        public async Task AddAndGetAll_BoardsIncludingSharedOnes_ListOfBoards(string username1, string username2, string name, string description)
        {
            // Arrange
            var board = new Board
            {
                Name = name,
                Description = description
            };

            // Act
            string boardId1 = await _uow.Boards.AddAsync(board, username1);
            string boardId2 = await _uow.Boards.AddAsync(board, username1);
            string boardId3 = await _uow.Boards.AddAsync(board, username2);
            await _uow.Boards.AddUserAsync(boardId3, username1);

            List<Board> returnedBoards = (await _uow.Boards.GetAllAsync(username1)).ToList();

            // Assert
            Assert.That(returnedBoards.Any(x => x.Id == boardId1 && !x.Shared), Is.True);
            Assert.That(returnedBoards.Any(x => x.Id == boardId2 && !x.Shared), Is.True);
            Assert.That(returnedBoards.Any(x => x.Id == boardId3 && x.Shared), Is.True);
        }
    }
}
