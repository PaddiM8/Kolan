using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Kolan.Models;
using Kolan.Repositories;

namespace Kolan.Controllers
{
    [Authorize]
    public class BoardsController : Controller
    {
        private readonly UnitOfWork _uow;

        public BoardsController(UnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<IActionResult> Index(string privateKey = null)
        {
            ViewData["username"] = User.Identity.Name;
            ViewData["privateKey"] = await _uow.Users.GetPrivateKey(User.Identity.Name);

            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
