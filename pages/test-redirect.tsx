import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TestRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the specified invoice
    router.push('/Plasa/invoices/2a06ff80-33f6-4a74-9fae-caced283cf45');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-xl font-bold">Redirecting to invoice...</h1>
        <p>If you are not redirected automatically, click the button below:</p>
        <button
          onClick={() => router.push('/Plasa/invoices/2a06ff80-33f6-4a74-9fae-caced283cf45')}
          className="mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          Go to Invoice
        </button>
      </div>
    </div>
  );
} 