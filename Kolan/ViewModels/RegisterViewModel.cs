using System;
using System.ComponentModel.DataAnnotations;

namespace Kolan.ViewModels
{
   public class RegisterViewModel
   {
      [Range(5, 512)]
      [Required]
      [DataType(DataType.EmailAddress)]
      public string Email { get; set; }

      [Range(3, 40)]
      [Required]
      public string Username { get; set; }

      [Range(6, 1024)]
      [Required]
      [DataType(DataType.Password)]
      public string Password { get; set; }

      [Range(6, 1024)]
      [Required]
      [DataType(DataType.Password)]
      public string RepeatPassword { get; set; }
   }
}
