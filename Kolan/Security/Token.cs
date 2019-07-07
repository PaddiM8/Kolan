using System;
using System.Text;
using System.Collections.Generic;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace Kolan.Security
{
   /// <summary>
   /// Managing JWT
   /// </summary>
   class Token
   {

      /// <summary>
      /// Create a new JWT token
      /// </summary>
      /// <param name="username">Username (probably temporary)</param>
      public static string Create(string username)
      {
         var symmetricKey = new SymmetricSecurityKey(Encoding.UTF8
               .GetBytes(Config.Values.SecurityKey));
         var signingCredentials = new SigningCredentials(symmetricKey,
               SecurityAlgorithms.HmacSha256Signature);
         var token = new JwtSecurityToken
         (
            signingCredentials: signingCredentials
         );

         token.Payload["user"] = username;

         return new JwtSecurityTokenHandler().WriteToken(token);
      }
   }
}
