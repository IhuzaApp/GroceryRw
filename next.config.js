/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_GRAPHQL_URL: process.env.HASURA_GRAPHQL_URL,
    NEXT_PUBLIC_HASURA_ACCESS_KEY: process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  },
  images: {
    domains: ["media.istockphoto.com", "png.pngtree.com"],
  },
};
