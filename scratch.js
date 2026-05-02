const { hasuraClient } = require("./src/lib/hasuraClient");
const { gql } = require("graphql-request");

async function run() {
  const query = gql`
    query {
      __type(name: "petAdoption") {
        name
        fields {
          name
          type {
            name
            kind
          }
        }
      }
    }
  `;
  try {
    const res = await hasuraClient.request(query);
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
}
run();
