using NUnit.Framework;
using Kolan.Repositories;
using Neo4jClient.Transactions;
using Kolan.Controllers.Api;
using System.Threading.Tasks;
using Kolan.Models;
using System;
using Newtonsoft.Json;
using System.Runtime.CompilerServices;

namespace Kolan.Tests
{
    public class BoardRepositoryTest
    {
        private UnitOfWork _uow;
        private ITransactionalGraphClient _graphClient;

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
            await _graphClient.Cypher.Match("(n)").DetachDelete("n").ExecuteWithoutResultsAsync();
        }

        [OneTimeSetUp]
        public async Task SetupTests()
        {
            Config.Load("../../../../server-config.json");
            new Database().Init();
            _graphClient = Database.Client;
            _uow = new UnitOfWork(_graphClient);
        }

        [TestCase("testUser1", "board", "some description")]
        [TestCase("testUser2", "board", "some description")]
        [TestCase("testUser1", "board", "")]
        [TestCase("testUser2", "board", "")]
        public async Task Add_RootBoardWithName_ReturnsId(string username, string name, string description)
        {
            string returnedId = await _uow.Boards.AddAsync
            (
                new Board
                {
                    Name = name,
                    Description = description
                },
                username
           );

            bool exists = await _uow.Boards.Exists(returnedId);

            Assert.That(returnedId, Is.Not.Null);
            Assert.That(exists, Is.True);
        }

        [TestCase("testUser1", "board", "some description")]
        [TestCase("testUser2", "board", "some description")]
        [TestCase("testUser1", "board", "")]
        [TestCase("testUser2", "board", "")]
        public async Task AddAndGet_BoardWithName_ReturnsBoardNoGroupsNoAncestorsAndUserAccess(string username, string name, string description)
        {
            string returnedId = await _uow.Boards.AddAsync
            (
                new Board
                {
                    Name = name,
                    Description = description
                },
                username
           );

            dynamic actual = await _uow.Boards.GetAsync(returnedId, username);
            Console.WriteLine(JsonConvert.SerializeObject(actual));

            Assert.That(returnedId, Is.Not.Null);
            Assert.That(actual.Board.Name, Is.EqualTo(name));
            Assert.That(actual.Board.Description, Is.EqualTo(description));
            Assert.That(actual.Groups, Is.Null);
            Assert.That(actual.Ancestors, Is.Empty);
            Assert.That(actual.UserAccess, Is.EqualTo("true"));
        }
    }
}
