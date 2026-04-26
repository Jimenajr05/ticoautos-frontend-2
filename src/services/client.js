import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

//Apollo Client
const client = new ApolloClient({
  uri: 'http://localhost:5000/graphql', 
  cache: new InMemoryCache(),
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`, 
  },
});

export default client;

