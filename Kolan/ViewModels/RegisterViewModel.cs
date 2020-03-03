using System;
using System.ComponentModel.DataAnnotations;

namespace Kolan.ViewModels
{
   public class RegisterViewModel
   {
      [Required]
      [DataType(DataType.EmailAddress)]
      public string Email { get; set; }

      [Required]
      public string Username { get; set; }

      [Required]
      [DataType(DataType.Password)]
      public string Password { get; set; }

      [Required]
      [DataType(DataType.Password)]
      public string RepeatPassword { get; set; }
   }
}
