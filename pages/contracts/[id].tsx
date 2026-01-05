import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { formatCurrencySync } from "../../src/utils/formatCurrency";
import RootLayout from "../../src/components/ui/layout";

interface ContractData {
  id: string;
  contractId: string;
  title: string;
  supplierName: string;
  supplierCompany: string;
  supplierEmail?: string;
  supplierPhone?: string;
  supplierAddress?: string;
  clientName?: string;
  clientCompany?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  contractType: string;
  status: string;
  startDate: string;
  endDate: string;
  totalValue: number;
  currency: string;
  paymentSchedule: string;
  progress: number;
  duration: string;
  paymentTerms: string;
  terminationTerms: string;
  specialConditions: string;
  deliverables: Array<{
    id?: string;
    description: string;
    dueDate: string;
    value: number;
    status?: string;
  }>;
  estimatedQuantity?: string | null;
  doneAt?: string | null;
  updateOn?: string | null;
  clientSignature?: string;
  clientPhoto?: string;
  supplierSignature?: string;
  supplierPhoto?: string;
}

function calculateProgress(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  
  if (now < start) return 0;
  if (now > end) return 100;
  
  const total = end - start;
  const elapsed = now - start;
  return Math.round((elapsed / total) * 100);
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "Not specified";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export default function ContractViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !router.isReady) return;

    async function fetchContract() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/queries/public-contract-details?id=${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Contract not found");
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch contract");
        }

        const data = await response.json();
        if (data.success && data.contract) {
          setContract(data.contract);
        } else {
          throw new Error("Invalid contract data");
        }
      } catch (err) {
        console.error("Error fetching contract:", err);
        setError(err instanceof Error ? err.message : "Failed to load contract");
      } finally {
        setLoading(false);
      }
    }

    fetchContract();
  }, [id, router.isReady]);

  const progress = contract ? calculateProgress(contract.startDate, contract.endDate) : 0;

  return (
    <RootLayout>
      <Head>
        <title>
          {contract ? `Contract ${contract.contractId} - PLAS` : "Contract - PLAS"}
        </title>
        <meta name="description" content="View contract details on PLAS platform" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4">
          {loading ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading contract...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                  Contract Not Found
                </h1>
                <p className="mb-4 text-gray-600 dark:text-gray-400">{error}</p>
                <button
                  onClick={() => router.push("/")}
                  className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                >
                  Go to Home
                </button>
              </div>
            </div>
          ) : contract ? (
            <div className="mx-auto max-w-4xl bg-[#faf9f6] px-8 py-12 shadow-2xl dark:bg-[#1a1814] md:px-16 md:py-16">
              {/* Document Header */}
              <div className="mb-8 border-b-2 border-gray-300 pb-6 dark:border-gray-600">
                <div className="mb-2 flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    PLAS
                  </h1>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Contract Tracking ID
                    </p>
                    <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                      {contract.id}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Contract Management Platform
                </p>
              </div>

              {/* Title */}
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                  PLAS BUSINESS SERVICES AGREEMENT
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  (Supplier–Client)
                </p>
              </div>

              {/* Introduction */}
              <div className="mb-8">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  This PLAS Business Services Agreement ("Agreement") is entered into and becomes effective as of{" "}
                  <span className="font-semibold">{formatDate(contract.startDate)}</span> ("Effective Date"), by and between:
                </p>
              </div>

              {/* Supplier Information */}
              <div className="mb-8">
                <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
                  Supplier Information
                </h2>
                <div className="ml-4 space-y-1 text-sm text-gray-800 dark:text-gray-200">
                  <p>
                    <span className="font-semibold">Legal Name:</span> {contract.supplierCompany || contract.supplierName || ". . . . . . . . . . . . . . . . . . . ."}
                  </p>
                  <p>
                    <span className="font-semibold">Registered Address:</span> {contract.supplierAddress || ". . . . . . . . . . . . . . . . . . . ."}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span> {contract.supplierEmail || ". . . . . . . . . . . . . . . . . . . ."}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span> {contract.supplierPhone || ". . . . . . . . . . . . . . . . . . . ."}
                  </p>
                </div>
              </div>

              {/* Client Information */}
              <div className="mb-8">
                <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
                  Client Information
                </h2>
                <div className="ml-4 space-y-1 text-sm text-gray-800 dark:text-gray-200">
                  <p>
                    <span className="font-semibold">Legal Name:</span> {contract.clientCompany || contract.clientName || ". . . . . . . . . . . . . . . . . . . ."}
                  </p>
                  <p>
                    <span className="font-semibold">Business Address:</span> {contract.clientAddress || ". . . . . . . . . . . . . . . . . . . ."}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span> {contract.clientEmail || ". . . . . . . . . . . . . . . . . . . ."}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span> {contract.clientPhone || ". . . . . . . . . . . . . . . . . . . ."}
                  </p>
                </div>
              </div>

              {/* Contract Details */}
              <div className="mb-8 space-y-4">
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    1. PURPOSE OF AGREEMENT
                  </h3>
                  <p className="ml-4 text-sm text-gray-800 dark:text-gray-200">
                    This Agreement establishes the general terms and conditions under which Supplier will provide services to Client. Specific services, pricing, timelines, and deliverables are detailed below.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    2. SCOPE OF SERVICES
                  </h3>
                  <p className="ml-4 text-sm text-gray-800 dark:text-gray-200">
                    Supplier agrees to provide professional services including: {contract.title || "Services as specified"}.
                  </p>
                  {contract.estimatedQuantity && (
                    <p className="ml-4 mt-2 text-sm text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">Quantity:</span> {contract.estimatedQuantity}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    3. TERM AND DURATION
                  </h3>
                  <p className="ml-4 text-sm text-gray-800 dark:text-gray-200">
                    This Agreement shall commence on <span className="font-semibold">{formatDate(contract.startDate)}</span> and continue until <span className="font-semibold">{formatDate(contract.endDate)}</span>. Duration: {contract.duration || "Not specified"}.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    4. FEES, PAYMENTS, AND TAXES
                  </h3>
                  <p className="ml-4 text-sm text-gray-800 dark:text-gray-200">
                    Client agrees to pay Supplier <span className="font-semibold">{formatCurrencySync(contract.totalValue)} {contract.currency || "RWF"}</span>. Payment Schedule: {contract.paymentSchedule || "Not specified"}. Payment Terms: {contract.paymentTerms || "Not specified"}.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    5. TERMINATION
                  </h3>
                  <p className="ml-4 text-sm text-gray-800 dark:text-gray-200">
                    Termination Terms: {contract.terminationTerms || "As per standard terms"}.
                  </p>
                </div>
              </div>

              {/* Deliverables */}
              {contract.deliverables && contract.deliverables.length > 0 && (
                <div className="mb-8">
                  <h3 className="mb-3 text-base font-bold text-gray-900 dark:text-white">
                    6. DELIVERABLES
                  </h3>
                  <div className="ml-4 space-y-3">
                    {contract.deliverables.map((deliverable, index) => (
                      <div key={deliverable.id || index} className="text-sm text-gray-800 dark:text-gray-200">
                        <p className="font-semibold">
                          {index + 1}. {deliverable.description || "Not specified"}
                        </p>
                        <p className="ml-4 text-xs text-gray-600 dark:text-gray-400">
                          Due Date: {formatDate(deliverable.dueDate)} | Value: {formatCurrencySync(deliverable.value)} {contract.currency || "RWF"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Conditions */}
              {contract.specialConditions && (
                <div className="mb-8">
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    7. SPECIAL CONDITIONS
                  </h3>
                  <p className="ml-4 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                    {contract.specialConditions}
                  </p>
                </div>
              )}

              {/* Progress Tracking */}
              <div className="mb-8 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
                <h3 className="mb-3 text-base font-bold text-gray-900 dark:text-white">
                  Contract Progress
                </h3>
                <div className="mb-2">
                  <div className="mb-1 flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full bg-green-600 transition-all duration-300 dark:bg-green-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-semibold">Start:</span> {formatDate(contract.startDate)}
                  </div>
                  <div>
                    <span className="font-semibold">End:</span> {formatDate(contract.endDate)}
                  </div>
                </div>
              </div>

              {/* Signatures Section */}
              <div className="mt-12 space-y-8 border-t-2 border-gray-300 pt-8 dark:border-gray-600">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                  {/* Supplier Signature */}
                  <div className="space-y-4">
                    <p className="mb-6 text-center text-base font-semibold text-gray-900 dark:text-white">
                      SUPPLIER
                    </p>
                    {contract.supplierSignature ? (
                      <div className="mb-6 flex items-center justify-center bg-white p-4 dark:bg-gray-900">
                        <img
                          src={contract.supplierSignature}
                          alt="Supplier signature"
                          className="max-h-24 w-auto object-contain dark:brightness-0 dark:invert"
                        />
                      </div>
                    ) : (
                      <div className="mb-6 flex h-24 items-center justify-center bg-gray-100 dark:bg-gray-700">
                        <span className="text-xs text-gray-400 dark:text-gray-500">No signature</span>
                      </div>
                    )}
                    <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                          {contract.supplierCompany || contract.supplierName || (
                            <span className="text-gray-400 dark:text-gray-500">. . . . . . . . . . . . . . . . . . . .</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                          {contract.updateOn ? (
                            formatDate(contract.updateOn)
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">. . . . . . . . . . . . . . . . . . . .</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Client Signature */}
                  <div className="space-y-4">
                    <p className="mb-6 text-center text-base font-semibold text-gray-900 dark:text-white">
                      CLIENT
                    </p>
                    {contract.clientSignature ? (
                      <div className="mb-6 flex items-center justify-center bg-white p-4 dark:bg-gray-900">
                        <img
                          src={contract.clientSignature}
                          alt="Client signature"
                          className="max-h-24 w-auto object-contain dark:brightness-0 dark:invert"
                        />
                      </div>
                    ) : (
                      <div className="mb-6 flex h-24 items-center justify-center bg-gray-100 dark:bg-gray-700">
                        <span className="text-xs text-gray-400 dark:text-gray-500">No signature</span>
                      </div>
                    )}
                    <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                          {contract.clientCompany || contract.clientName || (
                            <span className="text-gray-400 dark:text-gray-500">. . . . . . . . . . . . . . . . . . . .</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                          {contract.doneAt ? (
                            formatDate(contract.doneAt)
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">. . . . . . . . . . . . . . . . . . . .</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Notice */}
              <div className="mt-8 border-t-2 border-gray-300 pt-6 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  This contract is legally binding and enforceable under the laws governing the Plas Platform. For any disputes or issues, please reference the Contract Tracking ID: <span className="font-mono font-semibold">{contract.id}</span>
                </p>
              </div>

              {/* Back Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => router.push("/")}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Back to Home
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </RootLayout>
  );
}

