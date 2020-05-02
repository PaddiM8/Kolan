using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Kolan.Models
{
    public class Group
    {
        [JsonProperty("groupNode")]
        public GroupNode GroupNode  { get; set; }

        [JsonProperty("tasks")]
        public IEnumerable<BoardTask> Tasks { get; set; }
    }
}
