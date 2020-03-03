using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Kolan.Repositories;
using System.Security.Claims;
using Kolan.Security;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;

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
        /// Create a new user.
        /// </summary>
        /// <param name="username">Chosen username</param>
        /// <param name="password">Chosen password</param>
        [HttpPost("Create")]
        public async Task<IActionResult> Create(string email, string username, string password)
        {
            if (!Config.Values.AllowRegistrations) return Unauthorized();

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
