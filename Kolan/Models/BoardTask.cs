using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace Kolan.Models
{
    public class BoardTask
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

        [JsonProperty("encrypted")]
        public bool Encrypted { get; set; }

        [JsonProperty("encryptionKey")]
        public string EncryptionKey { get; set; }

        [JsonProperty("public")]
        public bool Public { get; set; } = false;

        [JsonProperty("tags")]
        public string Tags { get; set; }

        [JsonProperty("assignee")]
        public string Assignee { get; set; }

        [JsonProperty("deadline")]
        public long Deadline { get; set; }
    }
}
