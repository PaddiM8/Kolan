using System;
using System.ComponentModel.DataAnnotations;

namespace Kolan.ViewModels
{
    public class ChangePasswordViewModel
    {
        [Required]
        [DataType(DataType.Password)]
        public string CurrentPassword { get; set; }

        [Range(6, 1024)]
        [Required]
        [DataType(DataType.Password)]
        public string NewPassword { get; set; }

        [Range(6, 1024)]
        [Required]
        [DataType(DataType.Password)]
        public string RepeatPassword { get; set; }
    }
}
