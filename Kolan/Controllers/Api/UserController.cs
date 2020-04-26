using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Kolan.Repositories;
using Kolan.ViewModels;
using Kolan.Filters;
using System;
using Newtonsoft.Json;

namespace Kolan.Controllers.Api
{
    /// <summary>
    /// Managing users
    /// </summary>
    [Produces("application/json")]
    [Route("api/Users")]
    public class UsersController : Controller
    {
        private readonly UnitOfWork _uow;

        public UsersController(UnitOfWork uow)
        {
            _uow = uow;
        }

        /// <summary>
        /// Create a new user.
        /// </summary>
        /// <param name="model">A RegisterViewModel</param>
        [HttpPost("Create")]
        [ValidateModel]
        public async Task<IActionResult> Create(RegisterViewModel model)
        {
            if (!Config.Values.AllowRegistrations) return Unauthorized();

            string passwordHash = PBKDF2.Hash(model.Password);
            await _uow.Users.AddAsync(new User
            {
                Username = model.Username,
                Password = passwordHash,
                PublicKey = model.PublicKey,
                PrivateKey = model.PrivateKey
            });

            return Ok();
        }

        /// <summary>
        /// Lets any user get a user's public key
        /// </summary>
        /// <param name="username">Get the key from this user</param>
        [HttpGet("{username}/PublicKey")]
        public async Task<IActionResult> GetPublicKey(string username)
        {
            return Ok(new { key = await _uow.Users.GetPublicKey(username) });
        }

        /// <summary>
        /// Change a user's password
        /// </summary>
        /// <param name="username">Username of user</param>
        /// <param name="model">A ChangePasswordViewModel</param>
        [HttpPost("ChangePassword")]
        [ValidateModel]
        public async Task<IActionResult> ChangePassword(string username, ChangePasswordViewModel model)
        {
            if (await _uow.Users.ValidatePasswordAsync(username, model.CurrentPassword) == false)
            {
                return BadRequest("Invalid password.");
            }

            await _uow.Users.ChangePasswordAsync(username, model.NewPassword);

            return Ok();
        }

        /// <summary>
        /// Delete a user
        /// </summary>
        /// <param name="username">Username of user to delete</param>
        /// <param name="password">Password of user to delete, the user should confirm this manually.</param>
        [HttpDelete("{username}")]
        public async Task<IActionResult> Delete(string username, string password)
        {
            if (await _uow.Users.ValidatePasswordAsync(username, password))
            {
                await _uow.Users.DeleteAsync(username);

                return Ok();
            }

            return Unauthorized("Invalid password");
        }
    }
}
