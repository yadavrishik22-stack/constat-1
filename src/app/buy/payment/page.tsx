import { Suspense } from "react";
import { DemoPaymentPage } from "@/components/demo-payment";

export default function Page() {
  return (
    <Suspense fallback={<main className="loading">Opening demo payment…</main>}>
      <DemoPaymentPage />
    </Suspense>
  );
}
