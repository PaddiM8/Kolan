using System;
using System.Linq.Expressions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Neo4jClient;

namespace Kolan.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly IGraphClient Client;

        public Repository(IGraphClient client)
        {
            Client = client;
        }
    }
}
