using System;
using System.ComponentModel.DataAnnotations;

namespace Kolan.ViewModels
{
   public class LoginViewModel
   {
      [Required]
      public string Username { get; set; }

      [Required]
      [DataType(DataType.Password)]
      public string Password { get; set; }
   }
}
