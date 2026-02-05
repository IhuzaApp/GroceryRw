/**
 * Client-side error reporting. Calls /api/report-error which forwards to Slack via logErrorToSlack.
 * Use in "use client" components (e.g. PickupConfirmationScanner, userPayment, DeliveryConfirmationModal).
 */
export function reportErrorToSlackClient(
  where: string,
  error: unknown,
  extra?: Record<string, unknown>
): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  fetch("/api/report-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ where, message, stack, extra }),
  }).catch(() => {
    // Silently ignore if report fails (e.g. offline)
  });
}
