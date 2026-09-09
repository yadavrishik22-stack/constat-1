"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "./store";
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { ready, user, authError } = useStore();
  const router = useRouter();
  const path = usePathname();
  const target = !user
    ? "/login"
    : user.status !== "approved"
      ? "/account-status"
      : user.role !== "super_admin" &&
          ["/users", "/purchase-requests", "/projects", "/data"].includes(path)
        ? "/dashboard"
        : null;
  useEffect(() => {
    if (ready && !authError && target) router.replace(target);
  }, [ready, authError, target, router]);
  if (authError)
    return (
      <main id="main-content" className="loading">
        <p role="alert">{authError}</p>
      </main>
    );
  if (!ready || target)
    return (
      <div className="loading" role="status">
        Opening ConStat…
      </div>
    );
  return children;
}
