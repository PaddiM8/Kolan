using System;
using Newtonsoft.Json;

namespace Kolan
{
   class ConfigObject
   {
      [JsonProperty("databaseUrl")]
      public string DatabaseUrl      { get; set; }

      [JsonProperty("databaseUser")]
      public string DatabaseUser     { get; set; }

      [JsonProperty("databasePassword")]
      public string DatabasePassword { get; set; }

      [JsonProperty("securityKey")]
      public string SecurityKey { get; set; }

      [JsonProperty("saltLength")]
      public int SaltLength { get; set; }

      [JsonProperty("hashIterations")]
      public int HashIterations { get; set; }
   }
}
