import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
export default function Page() {
  return (
    <AuthGuard>
      <AppShell />
    </AuthGuard>
  );
}
