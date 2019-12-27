using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace Kolan
{
   public class User
   {
      [JsonProperty("id")]
      public string Id { get; set; }

      [JsonProperty("username")]
      [Required]
      [StringLength(32)]
      public string Username { get; set; }

      [JsonProperty("password")]
      [Required]
      [Range(3, 1024)]
      public string Password { get; set; }
   }
}
