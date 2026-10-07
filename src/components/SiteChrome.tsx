import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

const links = [
  { href: "/research", label: "Research" },
  { href: "/topics", label: "Topics" },
  { href: "/search", label: "Search" },
  { href: "/newsletter", label: "Newsletter" },
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Sign up" }
] as const;

export function Header() {
  return (
    <header className="border-b border-rule bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-page items-center justify-between px-5 py-4">
        <Link href="/" className="group">
          <span className="serif text-2xl font-semibold tracking-tight">{SITE_NAME}</span>
          <span className="ml-2 hidden text-xs uppercase tracking-[0.22em] text-muted sm:inline">Journal</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-rule">
      <div className="mx-auto grid max-w-page gap-8 px-5 py-12 md:grid-cols-3">
        <div>
          <p className="serif text-xl font-semibold">{SITE_NAME}</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
            Pranav Academic & Research Initiative. Original explanations of published research, with links to the source.
          </p>
        </div>
        <div className="text-sm text-muted">
          <p className="font-semibold text-ink">Read</p>
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/research">Research briefs</Link>
            <Link href="/topics">Topics</Link>
            <Link href="/search">Search</Link>
          </div>
        </div>
        <div className="text-sm text-muted">
          <p className="font-semibold text-ink">Note</p>
          <p className="mt-3 leading-6">
            PARI does not republish papers. Briefs are explanatory writing. Always follow the DOI to the original work.
          </p>
        </div>
      </div>
    </footer>
  );
}
