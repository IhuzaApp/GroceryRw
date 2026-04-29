import React from "react";
import { Button, IconButton, Tag } from "rsuite";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-xl">
          <div className="mb-4 text-4xl">🔒</div>
          <h2 className="mb-2 text-lg font-black text-slate-900">
            Authentication Required
          </h2>
          <p className="mb-6 text-sm text-slate-400">
            You must be logged in as a Project Admin to view error details.
          </p>
          <Link href="/dev/logs">
            <Button
              appearance="primary"
              className="!rounded-xl !bg-purple-600 font-black"
            >
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-xl">
          <div className="mb-4 text-4xl">🔍</div>
          <h2 className="mb-2 text-lg font-black text-slate-900">
            Log Not Found
          </h2>
          <p className="mb-6 text-sm text-slate-400">
            This log entry could not be found or has been cleaned up.
          </p>
          <Link href="/dev/logs">
            <Button appearance="subtle" className="!rounded-xl font-black">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "error":
        return {
          bg: "bg-rose-50",
          text: "text-rose-600",
          ring: "ring-rose-500/10",
          dot: "bg-rose-500",
        };
      case "warn":
        return {
          bg: "bg-amber-50",
          text: "text-amber-600",
          ring: "ring-amber-500/10",
          dot: "bg-amber-500",
        };
      case "info":
        return {
          bg: "bg-blue-50",
          text: "text-blue-600",
          ring: "ring-blue-500/10",
          dot: "bg-blue-500",
        };
      default:
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-600",
          ring: "ring-emerald-500/10",
          dot: "bg-emerald-500",
        };
    }
  };

  const typeColors = getTypeColor(log.type);

  const copyDetails = () => {
    navigator.clipboard.writeText(JSON.stringify(log.details, null, 2));
  };

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{
        backgroundImage:
          "radial-gradient(at 0% 0%, rgba(124, 58, 237, 0.04) 0px, transparent 50%)",
      }}
    >
      <Head>
        <title>Error Details | {log.id.slice(0, 8)}</title>
      </Head>

      {/* Mobile-friendly Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3 shadow-sm sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/dev/logs">
            <IconButton
              icon={<ArrowLeftIcon />}
              appearance="subtle"
              size="sm"
              className="flex-shrink-0 !rounded-xl hover:!bg-slate-100"
            />
          </Link>
          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-purple-50">
            <Image
              src="/assets/logos/plasIcon.png"
              alt="Plas"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black leading-none text-slate-900">
              Log Inspector
            </div>
            <div className="hidden truncate text-[9px] font-bold uppercase tracking-widest text-purple-500 sm:block">
              {log.id}
            </div>
          </div>
        </div>

        <span
          className={`flex-shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase ring-1 ring-inset ${typeColors.bg} ${typeColors.text} ${typeColors.ring}`}
        >
          {log.type}
        </span>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6 sm:px-6">
        {/* Message Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-50 p-5 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-purple-500">
                  {log.component}
                </p>
                <h1 className="break-words text-xl font-black leading-tight tracking-tight text-slate-900 sm:text-2xl">
                  {log.message}
                </h1>
              </div>
              <div className="flex-shrink-0 text-left sm:text-right">
                <div className="text-xs font-bold text-slate-500">
                  {new Date(log.time).toLocaleString()}
                </div>
                <div className="mt-1 hidden font-mono text-[10px] text-slate-300 sm:block">
                  {log.id}
                </div>
              </div>
            </div>
          </div>

          {/* Status indicator bar */}
          <div className={`h-1 w-full ${typeColors.dot}`}></div>
        </div>

        {/* Technical Trace */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-50 p-4 sm:p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Technical Trace
            </h3>
            <button
              onClick={copyDetails}
              className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-slate-400 transition-colors hover:bg-purple-50 hover:text-purple-600"
            >
              <CopyIcon /> Copy JSON
            </button>
          </div>
          <div className="bg-slate-50/50 p-4 sm:p-6">
            <pre className="max-h-[50vh] overflow-x-auto whitespace-pre-wrap break-all rounded-xl border border-slate-100 bg-white p-4 font-mono text-xs leading-relaxed text-slate-600 shadow-sm">
              {log.details ? (
                typeof log.details === "string" ? (
                  log.details
                ) : (
                  JSON.stringify(log.details, null, 2)
                )
              ) : (
                <span className="italic text-slate-300">
                  No additional details provided.
                </span>
              )}
            </pre>
          </div>
        </div>

        {/* Metadata */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8">
          <h3 className="mb-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Metadata
          </h3>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-8">
            <div>
              <div className="mb-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
                Source Component
              </div>
              <div className="break-words text-sm font-bold text-slate-900">
                {log.component.split(":")[0]}
              </div>
            </div>
            <div>
              <div className="mb-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
                Sub-Service
              </div>
              <div className="text-sm font-bold text-slate-900">
                {log.component.split(":")[1] || "Global"}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="mb-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
                Log ID
              </div>
              <div className="break-all font-mono text-[10px] text-slate-900 opacity-60">
                {log.id}
              </div>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="pb-6">
          <Link href="/dev/logs">
            <button className="flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-purple-600">
              <ArrowLeftIcon /> Back to System Logs
            </button>
          </Link>
        </div>
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
