using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

class ModelValidator
{
    public static (bool isValid, List<ValidationResult> results) Validate(object obj)
    {
        var results = new List<ValidationResult>();
        bool isValid = Validator.TryValidateObject(obj, new ValidationContext(obj), results, true);

        return (isValid, results);
    }
}
