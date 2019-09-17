using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Kolan.Models;
using Kolan.Repositories;

namespace Kolan.Controllers.Api
{
    [Route("api/Boards")]
    public class BoardsController : Controller
    {
        private readonly UnitOfWork _uow;

        public BoardsController(UnitOfWork uow)
        {
            _uow = uow;
        }

        [HttpGet]
        public async Task<object> Get()
        {
            return await _uow.Boards.GetAllAsync(User.Identity.Name);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm]string name, [FromForm]string description)
        {
            var board = new Board
            {
                Name = name,
                Description = description
            };

            await _uow.Boards.AddAsync(board, User.Identity.Name); // Add board to current user

            return new EmptyResult();
        }

        [Route("ChangeOrder")]
        [HttpPost]
        public async Task<IActionResult> ChangeOrder([FromForm]int fromIndex, [FromForm]int toIndex)
        {
            await _uow.Boards.SwapAsync(fromIndex, toIndex, User.Identity.Name);

            return new EmptyResult();
        }

    }
}
