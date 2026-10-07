type FetchCause = { code?: string; message?: string; syscall?: string };

function requestHost(input: RequestInfo | URL) {
  try {
    const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    return new URL(raw).hostname;
  } catch {
    return "unknown-host";
  }
}

/** Logs the undici cause (e.g. ENOTFOUND) without printing keys or full URLs. */
export async function supabaseFetch(input: RequestInfo | URL, init?: RequestInit) {
  try {
    return await fetch(input, init);
  } catch (err) {
    const cause = err instanceof Error ? (err as Error & { cause?: FetchCause }).cause : undefined;
    console.error(
      "[PARI] Supabase network error:",
      requestHost(input),
      err instanceof Error ? err.message : err,
      cause?.code || "",
      cause?.message || ""
    );
    throw err;
  }
}
