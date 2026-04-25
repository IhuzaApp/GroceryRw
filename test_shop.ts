import { GraphQLClient, gql } from 'graphql-request';

const client = new GraphQLClient('https://rwcwsqnffzshxdfjysmj.hasura.eu-central-1.nhost.run/v1/graphql', {
  headers: {
    'x-hasura-admin-secret': 'e84d63da6e25cb11f269a8b1ed49d115',
  },
});

const GET_SHOPS = gql`
  query {
    Shops(limit: 5) {
      id
      name
      ssd
    }
  }
`;

client.request(GET_SHOPS).then((data) => {
  console.log(JSON.stringify(data, null, 2));
}).catch(console.error);
