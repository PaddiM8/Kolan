using Newtonsoft.Json;

namespace Kolan.Models
{
    public class Ancestor
    {
        [JsonProperty("id")]
        public string Id { get; set; }
        [JsonProperty("name")] public string Name { get; set; }
    }
}