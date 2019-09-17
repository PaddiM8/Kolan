using System;
using System.Collections;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Kolan.Models
{
    public class Board
    {
        [JsonProperty("name")]
        public string Name        { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }
    }
}
