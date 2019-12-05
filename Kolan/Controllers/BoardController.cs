using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Kolan.Models;
using Kolan.Hubs;

namespace Kolan.Controllers
{
    public class BoardController : Controller
    {
        [HttpGet("Board/{id}")]
        public IActionResult Index(string id)
        {
            ViewData["id"] = id;
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
