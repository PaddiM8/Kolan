using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;
using Kolan.Enums;

namespace Kolan.Models
{
    public class Board
    {
        [JsonProperty("content")]
        public BoardTask Content { get; set; }

        [JsonProperty("groups")]
        public IEnumerable<Groups> Groups { get; set; }

        [JsonProperty("ancestors")]
        public IEnumerable<Ancestor> Ancestors { get; set; }

        [JsonProperty("userAccess")]
        public PermissionLevel UserAccess { get; set; }
    }
}
