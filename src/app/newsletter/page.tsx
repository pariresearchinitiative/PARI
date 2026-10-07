import { NewsletterForm } from "@/components/NewsletterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Get PARI research briefs when they are published."
};

export default function NewsletterPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="serif text-4xl font-semibold">Newsletter</h1>
      <p className="mt-4 text-lg leading-8 text-muted">
        PARI is built for people who cannot read every paper. The list is quiet on purpose. We store your email only to
        send briefs after they are approved.
      </p>
      <div className="mt-8">
        <NewsletterForm />
      </div>
    </main>
  );
}
