using System;
using System.IO;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Kolan
{
   static class Config
   {
      public static ConfigObject Values { get; private set; }

      public static void Load()
      {
         Values = JsonConvert.DeserializeObject<ConfigObject>(
               File.ReadAllText("../server-config.json"));
      }
   }
}
