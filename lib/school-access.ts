/** Hosted access requires project-wide Vercel Authentication (All Deployments).
 * Vercel enforces authorization before any application request reaches this server.
 * Keep the explicit server-side switch off on any unprotected hosting target.
 */
export function schoolSimulatorAllowed(
  env: Record<string, string | undefined>,
): boolean {
  if (
    env.VERCEL === "1" &&
    env.SCHOOL_SIMULATOR_ACCESS === "vercel-authentication"
  ) {
    return true;
  }
  return (
    env.NODE_ENV === "development" &&
    !env.VERCEL &&
    env.SCHOOL_SIMULATOR_LOCAL === "1"
  );
}
