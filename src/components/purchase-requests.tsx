"use client";

import { toast } from "sonner";
import { useStore } from "./store";
import { Badge, PageHeading, Table } from "./ui";
import { displayDate, money } from "@/lib/format";
import { PurchaseRequest } from "@/lib/purchase-models";

export function PurchaseRequestsPage() {
  const { purchaseRequests, purchases } = useStore();
  return (
    <>
      <PageHeading
        title="Purchase Requests"
        description="Locally submitted requests for a ConStat company setup."
      />
      <div className="info-note">
        <p>
          These requests exist only in this browser. A cloud lead inbox is
          planned for the production backend.
        </p>
      </div>
      <Table
        rows={purchaseRequests.toReversed()}
        empty="No purchase requests yet."
        columns={[
          {
            title: "Company",
            render: (r) => (
              <div>
                <strong>{r.companyName}</strong>
                <small className="cell-sub">
                  {r.projectCount
                    ? `${r.projectCount} site${r.projectCount === 1 ? "" : "s"}`
                    : "Sites not specified"}
                </small>
              </div>
            ),
          },
          {
            title: "Contact",
            render: (r) => (
              <div>
                <strong>{r.fullName}</strong>
                <small className="cell-sub">{r.email}</small>
              </div>
            ),
          },
          { title: "Phone", render: (r) => r.phone },
          { title: "Amount", render: (r) => money(r.amount) },
          {
            title: "Payment",
            render: (r) => (
              <div>
                <Badge>
                  {r.paymentStatus === "payment_successful"
                    ? "Payment Successful"
                    : "Pending Payment"}
                </Badge>
                {r.transactionReference && (
                  <small className="cell-sub">{r.transactionReference}</small>
                )}
              </div>
            ),
          },
          {
            title: "Submitted",
            render: (r) => displayDate(r.createdAt.slice(0, 10)),
          },
          {
            title: "Setup Status",
            render: (r) => (
              <select
                aria-label={`Status for ${r.companyName}`}
                value={r.status}
                onChange={(event) => {
                  try {
                    purchases.setStatus(
                      r.id,
                      event.target.value as PurchaseRequest["status"],
                    );
                    toast.success("Purchase request updated.");
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Unable to update request.",
                    );
                  }
                }}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            ),
          },
        ]}
      />
    </>
  );
}
