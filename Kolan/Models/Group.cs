using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Kolan.Models
{
    public class Group
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("amount")]
        public int Amount = 0;
    }
}
