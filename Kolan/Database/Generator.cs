using System;
using System.Text;
using System.Collections.Generic;
using Microsoft.IdentityModel.Tokens;
using HashidsNet;

namespace Kolan
{
   class Generator
   {
      public string Id(string salt)
      {
         long ticks = (long)(DateTime.UtcNow
               .Subtract(new DateTime(1970, 1, 1, 0, 0, 0, 0))).TotalMilliseconds; // Epoch time
         return new Hashids(salt).EncodeLong(ticks);
      }
   }
}
