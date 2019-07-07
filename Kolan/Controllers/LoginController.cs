using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Kolan.Models;
using Kolan.ViewModels;
using Kolan.Security;

namespace Kolan.Controllers
{
   [AllowAnonymous]
   public class LoginController : Controller
   {
      public IActionResult Index()
      {
         return View();
      }

      [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
      public IActionResult Error()
      {
         return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
      }

      [HttpPost("Login")]
      public async Task<IActionResult> Login(LoginViewModel model)
      {
         // Find user in database, grab just the password
         var passResults = await Database.Client.Cypher.Match($"(u:User {{ username: '{model.Username}' }})")
            .Return(u => u.As<User>().Password)
            .ResultsAsync;

         // Validate username
         if (passResults.Count() == 0)
         {
            ModelState.AddModelError("Username", "User doesn't exist");
            return View("Index", model);
         }

         // Validate password
         if (PBKDF2.Validate(model.Password, passResults.Single())) // Correct password, login
         {
            // Put username and JWT in claims
            var claims = new List<Claim>
            {
               new Claim(ClaimTypes.Name, model.Username),
               new Claim("token", Token.Create(model.Username))
            };

            var claimsIdentity = new ClaimsIdentity(claims,
                  CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties();

            await HttpContext.SignInAsync
            (
               CookieAuthenticationDefaults.AuthenticationScheme,
               new ClaimsPrincipal(claimsIdentity),
               authProperties
            );

            return RedirectToAction("Index", "Boards");
         }
         else
         {
            ModelState.AddModelError("Password", "Incorrect password.");
            return View("Index", model);
         }
      }
   }
}
