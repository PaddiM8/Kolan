using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.CookiePolicy;
using Kolan.Repositories;

namespace Kolan
{
   public class Startup
   {
      private IHostingEnvironment _env;
      public Startup(IConfiguration configuration)
      {
         Configuration = configuration;
      }

      public IConfiguration Configuration { get; }

      // This method gets called by the runtime. Use this method to add services to the container.
      public void ConfigureServices(IServiceCollection services)
      {
          // Dependency injection
          services.AddSingleton<UnitOfWork>(new UnitOfWork(Database.Client));

          // Security
         var signKey = new SymmetricSecurityKey(Encoding.UTF8
               .GetBytes(Config.Values.SecurityKey));

         services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
               options.TokenValidationParameters = new TokenValidationParameters
               {
                  ValidateLifetime = true,
                  ValidateIssuer = false,
                  ValidateAudience = false,
                  ValidateIssuerSigningKey = true,
                  IssuerSigningKey = signKey
               };
            });

         services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
               options.Cookie.HttpOnly = true;
               options.Cookie.SecurePolicy = _env.IsDevelopment()
                  ? CookieSecurePolicy.None : CookieSecurePolicy.Always;
               options.Cookie.SameSite = SameSiteMode.Strict;
               options.Cookie.Name = "Kolan.AuthCookieAspNetCore";
               options.LoginPath = "/Login";
               options.LogoutPath = "/Logout";
            });

         services.Configure<CookiePolicyOptions>(options =>
         {
            options.MinimumSameSitePolicy = SameSiteMode.Strict;
            options.HttpOnly = HttpOnlyPolicy.None;
            options.Secure = _env.IsDevelopment()
               ? CookieSecurePolicy.None : CookieSecurePolicy.Always;
         });

         services.AddMvc(options => options.Filters.Add(new AuthorizeFilter()));

         services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
      }

      // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
      public void Configure(IApplicationBuilder app, IHostingEnvironment env)
      {
         _env = env;
         if (env.IsDevelopment())
         {
            app.UseDeveloperExceptionPage();
         }
         else
         {
            app.UseExceptionHandler("/Home/Error");
            // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
         }

         app.UseHttpsRedirection();
         app.UseStaticFiles();
         app.UseAuthentication();

         app.UseMvc(routes =>
               {
               routes.MapRoute(
                     name: "default",
                     template: "{controller=Login}/{action=Index}/{id?}");

               routes.MapRoute(
                     name: "api",
                     template: "api/{controller}/{action}/{id?}");
               });
      }
   }
}
