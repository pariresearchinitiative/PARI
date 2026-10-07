import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-page px-5 py-24">
      <h1 className="serif text-4xl font-semibold">Page not found</h1>
      <p className="mt-4 text-muted">That brief is unpublished, missing, or the address is wrong.</p>
      <Link href="/research" className="mt-6 inline-block underline underline-offset-4">
        Back to research
      </Link>
    </main>
  );
}
