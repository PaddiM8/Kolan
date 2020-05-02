using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Kolan.Models
{
    public class Groups
    {
        [JsonProperty("group")]
        public Group Group  { get; set; }

        [JsonProperty("tasks")]
        public IEnumerable<BoardTask> Tasks { get; set; }
    }
}
