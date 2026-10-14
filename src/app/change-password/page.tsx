
import { requireAdmin } from "@/lib/auth";
import ChangePasswordForm from "./ChangePasswordForm";

export const metadata = {
  title: "Change Password | P.A.R.I. Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ChangePasswordPage() {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-accent">
        P.A.R.I. Admin
      </p>

      <h1 className="serif mt-3 text-4xl font-semibold">
        Change password
      </h1>

      <p className="mt-3 text-muted">
        Apne authenticated admin account ka password securely update karo.
      </p>

      <ChangePasswordForm />
    </main>
  );
}
