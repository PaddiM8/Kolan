using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using System.Security.Claims;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.CookiePolicy;
using Kolan.Repositories;
using Kolan.Hubs;

namespace Kolan
{
    public class Startup
    {
        private IWebHostEnvironment _env;
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

            // SignalR
            services.AddSignalR();

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

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_3_0);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
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
            app.UseRouting();
            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.UseStaticFiles(new StaticFileOptions()
            {
                FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "..", "node_modules/fa-icons")),
                RequestPath = new PathString("/node_modules/fa-icons")
            });
            app.UseStaticFiles(new StaticFileOptions()
            {
                FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "..", "node_modules/@fortawesome/fontawesome-free/sprites")),
                RequestPath = new PathString("/node_modules/@fortawesome/fontawesome-free/sprites")
            });
            app.UseAuthentication();

            EndpointRoutingApplicationBuilderExtensions.UseEndpoints(app, endpoints =>
                    {
                    endpoints.MapControllerRoute(
                            "default",
                            "{controller=Login}/{action=Index}/{id?}");

                    endpoints.MapControllerRoute(
                            "api",
                            "api/{controller}/{action}/{id?}");

                    endpoints.MapHub<BoardHub>("/hub");
                    });
        }
    }
}
