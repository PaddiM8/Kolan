using System;
using System.ComponentModel.DataAnnotations;

namespace Kolan.ViewModels
{
    public class ChangePasswordViewModel
    {
        [Required]
        [DataType(DataType.Password)]
        public string CurrentPassword { get; set; }

        [StringLength(1024, MinimumLength = 6, ErrorMessage = "Password length must be between {2} and {1}.")]
        [DataType(DataType.Password)]
        public string NewPassword { get; set; }

        [Compare("NewPassword", ErrorMessage = "Passwords don't match.")]
        [DataType(DataType.Password)]
        public string RepeatPassword { get; set; }
    }
}
