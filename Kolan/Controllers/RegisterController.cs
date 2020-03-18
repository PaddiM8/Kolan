using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Kolan.Models;
using Kolan.ViewModels;
using Kolan.Repositories;
using Kolan.Controllers.Api;
using Kolan.Filters;

namespace Kolan.Controllers
{
    [AllowAnonymous]
    public class RegisterController : Controller
    {
        private readonly UnitOfWork _uow;

        public RegisterController(UnitOfWork uow)
        {
            _uow = uow;
        }

        public IActionResult Index()
        {
            if (!Config.Values.AllowRegistrations) return Unauthorized();

            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (!Config.Values.AllowRegistrations) return Unauthorized();

            // Make sure the password fields have the same value
            if (model.Password != model.RepeatPassword)
            {
                ModelState.AddModelError("RepeatPassword", "Passwords don't match.");
            }

            if (!ModelState.IsValid) return View("Index", model);

            new UserController(_uow).Create(model);

            return RedirectToAction("Index", "Login");
        }
    }
}
