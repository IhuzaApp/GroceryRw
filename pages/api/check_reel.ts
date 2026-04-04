import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_REEL = gql`
  query GetReel($id: uuid!) {
    Reels(where: { id: { _eq: $id } }) {
      id
      title
      type
      Product
      video_url
      Restaurant {
        profile
      }
      Shops {
        image
      }
    }
  }
`;

async function check() {
  try {
    if (!hasuraClient) {
      throw new Error(
        "Hasura client is not available (missing env vars or running client-side)"
      );
    }
    const data = await hasuraClient.request(GET_REEL, {
      id: "c1ff8823-6f58-4776-b940-c14c20fa9ec2",
    });
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

check();
