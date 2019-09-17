using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Kolan.Models
{
    public class ChildBoardRelationship
    {
        [JsonProperty("index")]
        public int Index { get; set; }
    }
}
