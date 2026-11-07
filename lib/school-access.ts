/** Fail closed on every hosted build, including Vercel previews. No public enable switch. */
export function schoolSimulatorAllowed(
  env: Record<string, string | undefined>,
): boolean {
  return (
    env.NODE_ENV === "development" &&
    !env.VERCEL &&
    env.SCHOOL_SIMULATOR_LOCAL === "1"
  );
}
