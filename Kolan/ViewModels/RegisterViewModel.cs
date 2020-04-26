using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace Kolan.ViewModels
{
   public class RegisterViewModel
   {
      [StringLength(512, MinimumLength = 5)]
      [Required]
      [DataType(DataType.EmailAddress)]
      public string Email { get; set; }

      [StringLength(40, MinimumLength = 3, ErrorMessage = "{0} must be between {2} and {1} characters.")]
      [Required]
      [RegularExpression(@"\w+", ErrorMessage = "Username can only contain letters, numbers and underscores.")]
      public string Username { get; set; }

      [StringLength(1024, MinimumLength = 6, ErrorMessage = "{0} must be between {2} and {1} characters.")]
      [Required]
      [DataType(DataType.Password)]
      public string Password { get; set; }

      [Compare("Password")]
      [DataType(DataType.Password)]
      public string RepeatPassword { get; set; }

      [Required]
      public string PublicKey { get; set; }

      [Required]
      public string PrivateKey { get; set; }
   }
}
