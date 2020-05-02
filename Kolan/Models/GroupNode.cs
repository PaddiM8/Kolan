using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace Kolan.Models
{
    public class GroupNode
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }
    }
}
