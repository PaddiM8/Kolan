using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace Kolan
{
    public class PBKDF2
    {
        public static string Hash(string password)
        {
            byte[] salt = new byte[Config.Values.SaltLength];

            // Generate a random salt
            using (RNGCryptoServiceProvider csprng = new RNGCryptoServiceProvider())
            {
                csprng.GetBytes(salt);
            }

            // Hash the password and encode the parameters
            byte[] hash = Pbkdf2(password, salt, Config.Values.HashIterations, 20);
            return Config.Values.HashIterations + ":" + Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(hash);
        }

        private static byte[] Pbkdf2(string password, byte[] salt, int iterations, int outputBytes)
        {
            using (Rfc2898DeriveBytes pbkdf2 = new Rfc2898DeriveBytes(password, salt))
            {
                pbkdf2.IterationCount = iterations;
                return pbkdf2.GetBytes(outputBytes);
            }
        }

        public static bool Validate(string password, string correctHash)
        {
            // Extract the parameters from the hash
            var delimiter = new[] { ':' };
            var split = correctHash.Split(delimiter);
            var iterations = int.Parse(split[0]);
            var salt = Convert.FromBase64String(split[1]);
            var hash = Convert.FromBase64String(split[2]);
            var testHash = Pbkdf2(password, salt, iterations, hash.Length);

            return SlowEquals(hash, testHash);
        }

        private static bool SlowEquals(IList<byte> a, IList<byte> b)
        {
            var diff = (uint)a.Count ^ (uint)b.Count;

            for (var i = 0; (i < a.Count) && (i < b.Count); i++)
                diff |= (uint)(a[i] ^ b[i]);
            return diff == 0;
        }
    }
}
