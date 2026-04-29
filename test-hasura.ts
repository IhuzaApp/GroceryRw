import { hasuraClient } from "./src/lib/hasuraClient";
import { gql } from "graphql-request";

async function test() {
  try {
    if (!hasuraClient) return;
    const res = await hasuraClient.request(gql`
      query {
        __type(name: "System_Logs") {
          name
          fields {
            name
          }
        }
      }
    `);
    console.log(JSON.stringify(res, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
