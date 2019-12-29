using System;
using System.Collections.Generic;
using System.Security.Authentication;
using System.Threading.Tasks;
using System.Linq;
using Neo4jClient;
using Neo4jClient.Cypher;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Kolan.Models;
using Kolan.Repositories;

namespace Kolan.Controllers
{
    /// <summary>
    /// Managing users
    /// </summary>
    public class UserController : Controller
    {
        private readonly UnitOfWork _uow;

        public UserController(UnitOfWork uow)
        {
            _uow = uow;
        }

        /// <summary>
        /// Create a new user. TODO: Create a registration form
        /// </summary>
        /// <param name="username">Chosen username</param>
        /// <param name="password">Chosen password</param>
        /// <returns>Returns an empty string for now.</returns>
        [HttpPost("Create")]
        public async Task<string> Create(string username, string password)
        {
            string passwordHash = PBKDF2.Hash(password);
            await _uow.Users.AddAsync(new User { Username = username, Password = passwordHash });
            //await Database.Client.Cypher.Create($"(u:User {{ username: '{username}', password: '{passwordHash}' }})")
            //                      .ExecuteWithoutResultsAsync();
            return "";
        }
    }
}
