using System;
using System.IO;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Kolan
{
   public static class Config
   {
      public static ConfigObject Values { get; private set; }

      public static void Load(string file = "../server-config.json")
      {
         Values = JsonConvert.DeserializeObject<ConfigObject>(
               File.ReadAllText(file));
      }
   }
}