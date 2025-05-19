import React, { useState, useEffect } from "react";
import { Button, Panel, Loader, Message } from "rsuite";
import RootLayout from "@components/ui/layout";
import { ApolloError, gql, useQuery } from "@apollo/client";

// Simple query to test connection
const TEST_QUERY = gql`
  query TestConnection {
    __typename
  }
`;

export default function TestConnectionPage() {
  const [apiStatus, setApiStatus] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message?: string;
    details?: any;
  }>({ status: "idle" });

  const { loading, error, data, refetch } = useQuery(TEST_QUERY, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      console.error("GraphQL error:", error);
    },
  });

  // Function to test the API connection
  const testApiConnection = async () => {
    setApiStatus({ status: "loading" });
    try {
      const response = await fetch("/api/test-connection");
      const data = await response.json();

      if (data.status === "success") {
        setApiStatus({
          status: "success",
          message: "API connection successful",
          details: data,
        });
      } else {
        setApiStatus({
          status: "error",
          message: data.message || "API connection failed",
          details: data,
        });
      }
    } catch (error: any) {
      setApiStatus({
        status: "error",
        message: error.message || "API connection failed",
        details: error,
      });
    }
  };

  return (
    <RootLayout>
      <div className="p-4 md:ml-16">
        <div className="container mx-auto max-w-4xl">
          <h1 className="mb-6 text-2xl font-bold">Connection Test Page</h1>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Apollo Client Test */}
            <Panel header="Apollo Client Connection Test" bordered shaded>
              <p className="mb-4">
                This tests if your frontend can connect to Hasura directly using
                Apollo Client.
              </p>

              <div className="mb-4">
                <Button
                  appearance="primary"
                  onClick={() => refetch()}
                  loading={loading}
                  disabled={loading}
                >
                  Test Apollo Connection
                </Button>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-4">
                  <Loader content="Testing connection..." />
                </div>
              )}

              {error && (
                <Message type="error" className="mb-4">
                  <h4 className="font-bold">Connection Error</h4>
                  <p>{error.message}</p>
                  {error.networkError && (
                    <div className="mt-2">
                      <p className="font-semibold">Network Error:</p>
                      <pre className="mt-1 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-sm">
                        {JSON.stringify(error.networkError, null, 2)}
                      </pre>
                    </div>
                  )}
                </Message>
              )}

              {data && (
                <Message type="success" className="mb-4">
                  <h4 className="font-bold">Connection Successful</h4>
                  <p>Apollo client successfully connected to Hasura.</p>
                  <pre className="mt-2 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-sm">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </Message>
              )}
            </Panel>

            {/* API Connection Test */}
            <Panel header="API Connection Test" bordered shaded>
              <p className="mb-4">
                This tests if your backend API can connect to Hasura.
              </p>

              <div className="mb-4">
                <Button
                  appearance="primary"
                  onClick={testApiConnection}
                  loading={apiStatus.status === "loading"}
                  disabled={apiStatus.status === "loading"}
                >
                  Test API Connection
                </Button>
              </div>

              {apiStatus.status === "loading" && (
                <div className="flex items-center justify-center py-4">
                  <Loader content="Testing API connection..." />
                </div>
              )}

              {apiStatus.status === "error" && (
                <Message type="error" className="mb-4">
                  <h4 className="font-bold">API Connection Error</h4>
                  <p>{apiStatus.message}</p>
                  {apiStatus.details && (
                    <div className="mt-2">
                      <p className="font-semibold">Details:</p>
                      <pre className="mt-1 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-sm">
                        {JSON.stringify(apiStatus.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </Message>
              )}

              {apiStatus.status === "success" && (
                <Message type="success" className="mb-4">
                  <h4 className="font-bold">API Connection Successful</h4>
                  <p>Your API successfully connected to Hasura.</p>
                  {apiStatus.details && (
                    <div className="mt-2">
                      <p className="font-semibold">Environment:</p>
                      <pre className="mt-1 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-sm">
                        {JSON.stringify(apiStatus.details.env, null, 2)}
                      </pre>
                    </div>
                  )}
                </Message>
              )}
            </Panel>
          </div>

          <div className="mt-8">
            <Panel header="Troubleshooting" bordered>
              <h3 className="mb-3 text-lg font-semibold">Common Issues:</h3>
              <ul className="list-inside list-disc space-y-2">
                <li>
                  <strong>Connection refused errors:</strong> Make sure your
                  Hasura server is running and accessible.
                </li>
                <li>
                  <strong>Environment variables:</strong> Check that{" "}
                  <code>NEXT_PUBLIC_HASURA_GRAPHQL_URL</code> and{" "}
                  <code>HASURA_GRAPHQL_URL</code> are set correctly.
                </li>
                <li>
                  <strong>CORS issues:</strong> Ensure Hasura is configured to
                  allow requests from your frontend domain.
                </li>
                <li>
                  <strong>Authentication:</strong> Verify that authentication
                  headers are being sent correctly.
                </li>
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
