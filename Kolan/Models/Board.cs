using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace Kolan.Models
{
    public class Board
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("name")]
        [Required]
        [Range(1, 150)]
        public string Name { get; set; }

        [JsonProperty("description")]
        [StringLength(2000)]
        public string Description { get; set; }
    }
}
