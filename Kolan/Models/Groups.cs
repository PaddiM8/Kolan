using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Kolan.Models
{
    public class Groups
    {
        [JsonProperty("group")]
        public Group Group  { get; set; }

        [JsonProperty("boards")]
        public IEnumerable<Board> Boards { get; set; }
    }
}
