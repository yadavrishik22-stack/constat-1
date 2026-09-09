"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useStore } from "./store";
import { Badge, Button, Field, Modal, PageHeading, Table, Confirm } from "./ui";
import { PublicUser } from "@/lib/auth-models";
import { displayDate } from "@/lib/format";
const date = (value: string) => displayDate(value.slice(0, 10));
const run = (action: () => void, message: string) => {
  try {
    action();
    toast.success(message);
    return true;
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Unable to save.");
    return false;
  }
};
export function MySites() {
  const { db, repo, user, requests, auth, selectWorkspace } = useStore();
  const sites = repo.getSiteDirectory();
  const [request, setRequest] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const assigned = new Set(db.projects.map((p) => p.id));
  const siteName = (id: string) =>
    sites.find((s) => s.id === id)?.name ?? "Site no longer available";
  return (
    <>
      <PageHeading
        title="My Sites"
        description="Open an assigned construction site or ask your administrator for access."
      />
      <h2 className="access-section-title">Sites I Can Access</h2>
      <Table
        rows={db.projects}
        empty="No construction sites assigned yet"
        columns={[
          {
            title: "Construction site",
            render: (p) => <strong>{p.name}</strong>,
          },
          { title: "Site", render: (p) => p.siteName },
          {
            title: "Actions",
            render: (p) => (
              <Link
                className="btn btn-secondary"
                href="/dashboard"
                onClick={() => selectWorkspace(p.companyId, p.id)}
              >
                Open site
              </Link>
            ),
          },
        ]}
      />
      <h2 className="access-section-title">Available Sites</h2>
      <Table
        rows={sites.filter((s) => !assigned.has(s.id))}
        empty="No additional sites available."
        columns={[
          {
            title: "Construction site",
            render: (s) => <strong>{s.name}</strong>,
          },
          { title: "Site", render: (s) => s.siteName },
          {
            title: "Access",
            render: (s) =>
              requests.some(
                (r) =>
                  r.userId === user?.id &&
                  r.projectId === s.id &&
                  r.status === "pending",
              ) ? (
                <Badge>Pending</Badge>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setRequest(s.id);
                    setMessage("");
                  }}
                >
                  Request Access
                </Button>
              ),
          },
        ]}
      />
      <h2 className="access-section-title">My Requests</h2>
      <Table
        rows={requests.filter((r) => r.userId === user?.id).toReversed()}
        empty="No site requests yet."
        columns={[
          { title: "Site", render: (r) => siteName(r.projectId) },
          { title: "Requested", render: (r) => date(r.requestedAt) },
          { title: "Status", render: (r) => <Badge>{r.status}</Badge> },
          { title: "Message", render: (r) => r.optionalMessage || "—" },
        ]}
      />
      <Modal
        open={!!request}
        onClose={() => setRequest(null)}
        title={`Request access to ${siteName(request ?? "")}`}
        description="Your administrator will review this request."
      >
        <form
          className="access-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              run(
                () => auth.requestSite(request!, message),
                "Access requested.",
              )
            )
              setRequest(null);
          }}
        >
          <Field label="Message (optional)">
            <textarea
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Field>
          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setRequest(null)}
            >
              Cancel
            </Button>
            <Button type="submit">Send Request</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
export function UserManagement() {
  const { users, memberships, requests, db, auth } = useStore();
  const [tab, setTab] = useState("Pending Approvals");
  const [editing, setEditing] = useState<{
    user: PublicUser;
    approve: boolean;
  } | null>(null);
  const [view, setView] = useState<PublicUser | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<{
    user: PublicUser;
    status: "rejected" | "inactive";
  } | null>(null);
  function edit(user: PublicUser, approve = false) {
    setEditing({ user, approve });
    setSelected(
      memberships
        .filter((m) => m.userId === user.id && m.status === "active")
        .map((m) => m.projectId),
    );
  }
  const employees = users.filter((u) => u.role === "employee");
  const accessible = (id: string) =>
    memberships.filter(
      (m) =>
        m.userId === id &&
        m.status === "active" &&
        db.projects.some((p) => p.id === m.projectId),
    );
  return (
    <>
      <PageHeading
        title="User Management"
        description="Approve your team and decide which construction sites each employee can access."
      />
      <div
        className="access-tabs"
        role="tablist"
        aria-label="User management sections"
      >
        {[
          "Pending Approvals",
          "Employees",
          "Site Access",
          "Site Access Requests",
        ].map((t) => (
          <button
            role="tab"
            aria-selected={tab === t}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
            {t === "Pending Approvals" &&
              ` (${employees.filter((u) => u.status === "pending").length})`}
          </button>
        ))}
      </div>
      {tab === "Site Access Requests" ? (
        <Table
          rows={requests.toReversed()}
          empty="No site access requests."
          columns={[
            {
              title: "Employee",
              render: (r) => (
                <div>
                  <strong>
                    {users.find((u) => u.id === r.userId)?.fullName ??
                      "Unknown employee"}
                  </strong>
                  <small className="cell-sub">{r.optionalMessage}</small>
                </div>
              ),
            },
            {
              title: "Site",
              render: (r) =>
                db.projects.find((p) => p.id === r.projectId)?.name ??
                "Deleted site",
            },
            { title: "Requested", render: (r) => date(r.requestedAt) },
            { title: "Status", render: (r) => <Badge>{r.status}</Badge> },
            {
              title: "Actions",
              render: (r) =>
                r.status === "pending" ? (
                  <div className="inline-actions">
                    <Button
                      onClick={() =>
                        run(
                          () => auth.resolveRequest(r.id, true),
                          "Site access granted.",
                        )
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        run(
                          () => auth.resolveRequest(r.id, false),
                          "Request rejected.",
                        )
                      }
                    >
                      Reject
                    </Button>
                  </div>
                ) : (
                  "Reviewed"
                ),
            },
          ]}
        />
      ) : (
        <Table
          rows={employees.filter((u) =>
            tab === "Pending Approvals"
              ? u.status === "pending"
              : tab === "Site Access"
                ? u.status === "approved"
                : u.status !== "pending",
          )}
          empty={
            tab === "Pending Approvals"
              ? "No accounts awaiting approval."
              : "No employees yet."
          }
          columns={[
            {
              title: "Employee",
              render: (u) => (
                <div>
                  <strong>{u.fullName}</strong>
                  <small className="cell-sub">{u.username}</small>
                </div>
              ),
            },
            { title: "Email", render: (u) => u.email },
            {
              title:
                tab === "Pending Approvals" ? "Requested" : "Accessible Sites",
              render: (u) =>
                tab === "Pending Approvals"
                  ? date(u.createdAt)
                  : accessible(u.id)
                      .map(
                        (m) =>
                          db.projects.find((p) => p.id === m.projectId)?.name,
                      )
                      .join(", ") || "No sites assigned",
            },
            { title: "Status", render: (u) => <Badge>{u.status}</Badge> },
            {
              title: "Actions",
              render: (u) => (
                <div className="inline-actions">
                  <Button variant="ghost" onClick={() => setView(u)}>
                    View
                  </Button>
                  {u.status === "pending" ? (
                    <>
                      <Button onClick={() => edit(u, true)}>Approve</Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          setConfirm({ user: u, status: "rejected" })
                        }
                      >
                        Reject
                      </Button>
                    </>
                  ) : u.status === "approved" ? (
                    <>
                      <Button variant="secondary" onClick={() => edit(u)}>
                        Manage Site Access
                      </Button>
                      {u.id !== "user-demo-employee" && (
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setConfirm({ user: u, status: "inactive" })
                          }
                        >
                          Deactivate
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button variant="secondary" onClick={() => edit(u, true)}>
                      Approve / Reactivate
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`${editing?.approve ? "Approve" : "Site access for"} ${editing?.user.fullName ?? ""}`}
        description="Select any number of construction sites. Leaving every box unchecked gives no site access."
      >
        <form
          className="access-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!editing) return;
            const { user, approve } = editing;
            if (
              run(
                () =>
                  approve
                    ? auth.setStatus(user.id, "approved", selected)
                    : auth.setSiteAccess(user.id, selected),
                approve ? "Employee approved." : "Site access updated.",
              )
            )
              setEditing(null);
          }}
        >
          <div className="site-checkboxes">
            {db.projects.length ? (
              db.projects.map((p) => (
                <label key={p.id}>
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? [...selected, p.id]
                          : selected.filter((id) => id !== p.id),
                      )
                    }
                  />
                  <span>
                    <strong>{p.name}</strong>
                    <small>
                      {db.companies.find((c) => c.id === p.companyId)?.name} ·{" "}
                      {p.siteName}
                    </small>
                  </span>
                </label>
              ))
            ) : (
              <p>Create a project to assign site access.</p>
            )}
          </div>
          <div className="form-actions">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editing?.approve ? "Approve Employee" : "Save Access"}
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        open={!!view}
        onClose={() => setView(null)}
        title={view?.fullName ?? "Employee"}
        description="Employee account details"
      >
        <dl className="user-details">
          <dt>Username</dt>
          <dd>{view?.username}</dd>
          <dt>Email</dt>
          <dd>{view?.email}</dd>
          <dt>Status</dt>
          <dd>{view?.status}</dd>
          <dt>Requested</dt>
          <dd>{view && date(view.createdAt)}</dd>
          <dt>Approved</dt>
          <dd>{view?.approvedAt ? date(view.approvedAt) : "Not approved"}</dd>
          <dt>Approved by</dt>
          <dd>
            {users.find((u) => u.id === view?.approvedBy)?.fullName ?? "—"}
          </dd>
        </dl>
      </Modal>
      <Confirm
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={`${confirm?.status === "rejected" ? "Reject" : "Deactivate"} ${confirm?.user.fullName}?`}
        description="This account will not be able to enter the application. Existing operational records will be preserved."
        onConfirm={() => {
          if (
            confirm &&
            run(
              () => auth.setStatus(confirm.user.id, confirm.status),
              "Account status updated.",
            )
          )
            setConfirm(null);
        }}
      />
    </>
  );
}
