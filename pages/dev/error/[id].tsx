import React from "react";
import { Container, Button, Panel, Tag, Stack, Divider, IconButton } from "rsuite";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { GraphQLClient, gql } from "graphql-request";
import ArrowLeftIcon from "@rsuite/icons/ArrowLeft";
import CopyIcon from "@rsuite/icons/Copy";
import "../logs.css";

const HASURA_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!;

const GET_LOG_BY_ID = gql`
  query GetLogById($id: uuid!) {
    System_Logs_by_pk(id: $id) {
      id
      type
      message
      component
      details
      time
    }
  }
`;

interface LogDetailProps {
  log: any;
  authenticated: boolean;
}

const LogDetailPage: React.FC<LogDetailProps> = ({ log, authenticated }) => {
  if (!authenticated) {
    return (
      <div className="dev-page-container flex items-center justify-center">
        <Panel className="premium-card p-8 text-center">
          <h2 className="text-red-400 mb-4">Authentication Required</h2>
          <p className="text-slate-400 mb-6">You must be logged in as a Project Admin to view error details.</p>
          <Link href="/dev/logs">
            <Button appearance="primary">Go to Login</Button>
          </Link>
        </Panel>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="dev-page-container flex items-center justify-center">
        <Panel className="premium-card p-8 text-center">
          <h2 className="text-slate-400 mb-4">Log Not Found</h2>
          <p className="text-slate-500 mb-6">The requested log entry could not be found or has been cleaned up.</p>
          <Link href="/dev/logs">
            <Button appearance="subtle">Back to Dashboard</Button>
          </Link>
        </Panel>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "error": return "red";
      case "warn": return "orange";
      case "info": return "blue";
      case "debug": return "green";
      default: return "cyan";
    }
  };

  const copyDetails = () => {
    navigator.clipboard.writeText(JSON.stringify(log.details, null, 2));
  };

  return (
    <div className="dev-page-container">
      <Head>
        <title>Error Details | {log.id.slice(0,8)}</title>
      </Head>
      
      <header className="dashboard-header premium-card m-4 !rounded-xl">
        <div className="flex items-center gap-4">
          <Link href="/dev/logs">
            <IconButton icon={<ArrowLeftIcon />} appearance="subtle" className="hover:bg-slate-100" />
          </Link>
          <div className="dashboard-title">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-purple-200">
              P
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-900 leading-none">Error Details</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Log Inspector</span>
            </div>
          </div>
        </div>
        <Tag color={getTypeColor(log.type)} className="uppercase font-black px-3 py-1 text-[10px] rounded-lg">
          {log.type}
        </Tag>
      </header>

      <main className="dashboard-content max-w-5xl mx-auto w-full">
        <Panel className="premium-card p-0 overflow-hidden !bg-white">
          <div className="p-8 border-b border-slate-100">
            <Stack justifyContent="space-between" alignItems="flex-start">
              <div>
                <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">{log.message}</h1>
                <p className="text-purple-600 font-bold text-xs uppercase tracking-widest">{log.component}</p>
              </div>
              <div className="text-right text-slate-400 text-xs">
                <div className="font-bold">{new Date(log.time).toLocaleString()}</div>
                <div className="font-mono mt-1 opacity-60">{log.id}</div>
              </div>
            </Stack>
          </div>

          <div className="p-8 bg-slate-50/50">
            <Stack justifyContent="space-between" className="mb-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technical Trace</h3>
              <IconButton 
                icon={<CopyIcon />} 
                size="xs" 
                onClick={copyDetails}
                appearance="subtle"
                className="text-slate-400 hover:text-purple-600"
              >
                Copy JSON
              </IconButton>
            </Stack>
            
            <pre className="details-pre !max-h-none !text-sm !bg-white !border-slate-200 !text-slate-600 shadow-sm">
              {log.details ? (
                typeof log.details === 'string' 
                  ? log.details 
                  : JSON.stringify(log.details, null, 2)
              ) : (
                <span className="italic text-slate-400 text-xs">No additional details provided.</span>
              )}
            </pre>
          </div>

          <div className="p-8 border-t border-slate-100 bg-white">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Metadata</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-black mb-1">Source Component</div>
                <div className="text-slate-900 font-bold text-sm">{log.component.split(':')[0]}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-black mb-1">Sub-Service</div>
                <div className="text-slate-900 font-bold text-sm">{log.component.split(':')[1] || "Global"}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-black mb-1">Log ID</div>
                <div className="text-slate-900 font-mono text-[11px] opacity-60">{log.id}</div>
              </div>
            </div>
          </div>
        </Panel>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  const { req } = context;
  const token = req.cookies.project_admin_session;

  let authenticated = false;
  if (token) {
    try {
      const jwt = require("jsonwebtoken");
      const JWT_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-key";
      jwt.verify(token, JWT_SECRET);
      authenticated = true;
    } catch (e) {}
  }

  if (!authenticated) {
    return { props: { log: null, authenticated: false } };
  }

  try {
    const client = new GraphQLClient(HASURA_URL, {
      headers: { "x-hasura-admin-secret": HASURA_SECRET },
    });

    const data = await client.request<any>(GET_LOG_BY_ID, { id });

    return {
      props: {
        log: data.System_Logs_by_pk,
        authenticated: true,
      },
    };
  } catch (error) {
    console.error("Error fetching log detail:", error);
    return {
      props: {
        log: null,
        authenticated: true,
      },
    };
  }
};

export default LogDetailPage;
