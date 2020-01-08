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
        [Required(ErrorMessage = "A name is required")]
        [StringLength(150, ErrorMessage = "Name may not be more than 150 characters long.")]
        public string Name { get; set; }

        [JsonProperty("description")]
        [StringLength(2000, ErrorMessage = "Description may not be more than 2000 characters long.")]
        public string Description { get; set; }

        [JsonProperty("shared")]
        public bool Shared { get; set; } = false;
    }
}
