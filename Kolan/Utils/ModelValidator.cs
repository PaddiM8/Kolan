using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Newtonsoft.Json;

class ModelValidator
{
    public static (bool isValid, string errors) Validate(object obj)
    {
        var results = new List<ValidationResult>();
        bool isValid = Validator.TryValidateObject(obj, new ValidationContext(obj), results, true);

        var errorDict = new Dictionary<string, string[]>();
        foreach (ValidationResult result in results)
        {
            string name = result.MemberNames.First();
            name = Char.ToLowerInvariant(name[0]) + name.Substring(1); // Make first letter lower case

            errorDict[name] = new string[] { result.ErrorMessage };
        }

        return (isValid, JsonConvert.SerializeObject(errorDict));
    }
}
