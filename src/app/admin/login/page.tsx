import { Suspense } from "react";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md px-5 py-20">Loading…</main>}>
      <AdminLoginForm />
    </Suspense>
  );
}
