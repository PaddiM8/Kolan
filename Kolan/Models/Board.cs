using System;
using System.Collections;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Kolan.Models
{
    public class Board
    {
        [JsonProperty("id")]
        public string Id          { get; set; }

        [JsonProperty("name")]
        public string Name        { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }
    }
}
