using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Kolan.Models;
using Kolan.ViewModels;
using Kolan.Repositories;
using Kolan.Controllers.Api;
using System.Threading.Tasks;
using System;

namespace Kolan.Controllers
{
    public class UserSettingsController : Controller
    {
        private readonly UnitOfWork _uow;
        public UserSettingsController(UnitOfWork uow)
        {
            _uow = uow;
        }

        public IActionResult Index()
        {
            ViewData["username"] = User.Identity.Name;

            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        [HttpPost]
        public async Task<IActionResult> ChangePassword(ChangePasswordViewModel model)
        {
            if (!ModelState.IsValid) return View("Index", model);

            // Change the password
            var userController = new UsersController(_uow);
            IActionResult result = await userController.ChangePassword(User.Identity.Name, model);

            // Check for failure
            if (result is BadRequestObjectResult)
            {
                ModelState.AddModelError("CurrentPassword", "Invalid password.");
                return View("Index", model);
            }

            TempData["message"] = "Password changed successfully.";

            return RedirectToAction("Index");
        }
    }
}
