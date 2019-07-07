using System;
using System.Linq;
using System.Collections.Generic;
using Neo4jClient;

namespace Kolan
{
   static class Database
   {
      public static GraphClient Client;

      public static void Init()
      {
         Client = new GraphClient(new Uri(Config.Values.DatabaseUrl),
                                  Config.Values.DatabaseUser,
                                  Config.Values.DatabasePassword);
         Client.Connect();

         var query = Client.Cypher.Match("(n)")
                      .Return(n => n.As<object>())
                      .Limit(1);
         if (query.Results.Count() == 0)
            Setup();
      }

      public static void Setup()
      {
         try
         {
            Client.Cypher.CreateUniqueConstraint("u:User", "u.username")
                         .ExecuteWithoutResults();
         }
         catch(NeoException)
         {
            return;
         }
      }
   }
}
