using System;
using System.Linq.Expressions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Neo4jClient;

namespace Kolan.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly GraphClient Client;

        public Repository(GraphClient client)
        {
            Client = client;
        }
    }
}
