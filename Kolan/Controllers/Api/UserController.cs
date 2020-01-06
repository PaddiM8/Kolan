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

namespace Kolan.Controllers.Api
{
    /// <summary>
    /// Managing users
    /// </summary>
    [Produces("application/json")]
    [Route("api/Login")]
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
        [HttpPost("Create")]
        public async Task<IActionResult> Create(string username, string password)
        {
            string passwordHash = PBKDF2.Hash(password);
            await _uow.Users.AddAsync(new User { Username = username, Password = passwordHash });
            return Ok();
        }

        public async Task<IActionResult> ChangePassword(string username, string currentPassword, string newPassword)
        {
            if (await _uow.Users.ValidatePassword(username, currentPassword) == false)
            {
                return BadRequest("Invalid password.");
            }

            _uow.Users.ChangePassword(username, newPassword);

            return Ok();
        }
    }
}
