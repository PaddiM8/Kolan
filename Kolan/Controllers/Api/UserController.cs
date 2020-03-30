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
        [ValidateModel]
        public async Task<IActionResult> Create(RegisterViewModel model)
        {
            if (!Config.Values.AllowRegistrations) return Unauthorized();

            string passwordHash = PBKDF2.Hash(model.Password);
            await _uow.Users.AddAsync(new User { Username = model.Username, Password = passwordHash });
            return Ok();
        }

        [HttpPost("ChangePassword")]
        [ValidateModel]
        public async Task<IActionResult> ChangePassword(string username, ChangePasswordViewModel model)
        {
            if (await _uow.Users.ValidatePassword(username, model.CurrentPassword) == false)
            {
                return BadRequest("Invalid password.");
            }

            await _uow.Users.ChangePassword(username, model.NewPassword);

            return Ok();
        }
    }
}
