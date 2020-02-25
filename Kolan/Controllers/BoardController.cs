using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Kolan.Models;

namespace Kolan.Controllers
{
    public class BoardController : Controller
    {
        [AllowAnonymous]
        [HttpGet("Board/{id}")]
        public IActionResult Index(string id)
        {
            ViewData["id"] = id;
            ViewData["username"] = User.Identity.Name;

            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
