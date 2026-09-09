import {
  Access,
  AuthDatabase,
  authDatabaseSchema,
  PublicUser,
  publicUser,
  signupSchema,
} from "./auth-models";
import { StorageAdapter } from "./repository";
import { seedAccounts } from "./auth-seed";
import { hashPassword, verifyPassword } from "./passwords";
import { newId } from "./id";
export const AUTH_KEY = "constat.accounts.v1";
export const SESSION_KEY = "constat.session.v1";
type Snapshot = {
  user: PublicUser | null;
  users: PublicUser[];
  memberships: AuthDatabase["memberships"];
  requests: AuthDatabase["requests"];
};
export class AuthRepository {
  private db: AuthDatabase = {
    version: 1,
    users: [],
    memberships: [],
    requests: [],
  };
  private sessionId = "";
  private listeners = new Set<() => void>();
  private snapshot: Snapshot = {
    user: null,
    users: [],
    memberships: [],
    requests: [],
  };
  constructor(
    private storage: StorageAdapter,
    private session: StorageAdapter,
    private projectExists: (id: string) => boolean,
  ) {}
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  getSnapshot = () => this.snapshot;
  getAccess = (): Access => {
    const u = this.current();
    return u?.status === "approved"
      ? {
          role: u.role === "super_admin" ? "Super Admin" : "Employee",
          projectIds: this.db.memberships
            .filter((m) => m.userId === u.id && m.status === "active")
            .map((m) => m.projectId),
        }
      : null;
  };
  private current() {
    return this.db.users.find((u) => u.id === this.sessionId);
  }
  private emit() {
    const u = this.current();
    const admin = u?.status === "approved" && u.role === "super_admin";
    this.snapshot = {
      user: u ? publicUser(u) : null,
      users: admin ? this.db.users.map(publicUser) : [],
      memberships: this.db.memberships.filter(
        (m) => admin || m.userId === u?.id,
      ),
      requests: this.db.requests.filter((r) => admin || r.userId === u?.id),
    };
    this.listeners.forEach((f) => f());
  }
  async hydrate(projectId: string) {
    const raw = this.storage.read();
    if (raw) this.db = authDatabaseSchema.parse(JSON.parse(raw));
    else {
      const seed = await seedAccounts(projectId);
      const latest = this.storage.read();
      this.db = latest ? authDatabaseSchema.parse(JSON.parse(latest)) : seed;
      if (!latest) this.storage.write(JSON.stringify(seed));
    }
    this.sessionId = this.session.read() ?? "";
    this.emit();
  }
  reload() {
    try {
      const raw = this.storage.read();
      this.db = raw
        ? authDatabaseSchema.parse(JSON.parse(raw))
        : { version: 1, users: [], memberships: [], requests: [] };
      this.sessionId = this.session.read() ?? "";
    } catch (e) {
      this.sessionId = "";
      this.emit();
      throw e;
    }
    this.emit();
  }
  private commit(db: AuthDatabase) {
    const next = authDatabaseSchema.parse(db);
    try {
      this.storage.write(JSON.stringify(next));
    } catch {
      throw new Error(
        "Browser storage is full or unavailable. Account changes were not saved.",
      );
    }
    this.db = next;
    this.emit();
  }
  private admin() {
    this.reload();
    const u = this.current();
    if (!u || u.status !== "approved" || u.role !== "super_admin")
      throw new Error(
        "Only an approved Super Admin can manage users and site access.",
      );
    return u;
  }
  private employee() {
    this.reload();
    const u = this.current();
    if (!u || u.status !== "approved")
      throw new Error("Your account must be approved first.");
    return u;
  }
  async login(identifier: string, password: string) {
    this.reload();
    const normalized = identifier.trim().toLowerCase();
    const u = this.db.users.find(
      (u) => u.email === normalized || u.username === normalized,
    );
    if (!u || !(await verifyPassword(password, u.passwordHash)))
      throw new Error("Email, username or password is incorrect.");
    this.reload();
    if (
      !this.db.users.some(
        (current) =>
          current.id === u.id && current.passwordHash === u.passwordHash,
      )
    )
      throw new Error("Account changed. Please try again.");
    this.session.write(u.id);
    this.sessionId = u.id;
    this.emit();
    return this.snapshot.user!;
  }
  logout() {
    this.session.write("");
    this.sessionId = "";
    this.emit();
  }
  async signup(input: unknown) {
    const form = signupSchema.parse(input);
    const passwordHash = await hashPassword(form.password);
    this.reload();
    if (this.db.users.some((u) => u.email === form.email))
      throw new Error("This email is already registered.");
    if (this.db.users.some((u) => u.username === form.username))
      throw new Error("This username is already taken.");
    const stamp = new Date().toISOString();
    const user = {
      id: newId(),
      fullName: form.fullName,
      email: form.email,
      username: form.username,
      passwordHash,
      role: "employee" as const,
      status: "pending" as const,
      createdAt: stamp,
      updatedAt: stamp,
      approvedAt: null,
      approvedBy: null,
    };
    this.commit({ ...this.db, users: [...this.db.users, user] });
    try {
      this.session.write(user.id);
    } catch {
      throw new Error(
        "Account created, but the session could not be saved. Please log in.",
      );
    }
    this.sessionId = user.id;
    this.emit();
  }
  setStatus(
    id: string,
    status: "approved" | "rejected" | "inactive",
    projectIds?: string[],
  ) {
    const admin = this.admin();
    const user = this.db.users.find((u) => u.id === id);
    if (!user || user.role !== "employee")
      throw new Error("Choose an employee account.");
    if (id === "user-demo-employee" && status !== "approved")
      throw new Error(
        "The permanent demo employee stays approved. Use a signup account to test deactivation.",
      );
    const next = structuredClone(this.db);
    const target = next.users.find((u) => u.id === id)!;
    const stamp = new Date().toISOString();
    target.status = status;
    target.updatedAt = stamp;
    if (status === "approved") {
      target.approvedAt = stamp;
      target.approvedBy = admin.id;
    }
    if (projectIds) this.assign(next, id, projectIds, admin.id);
    this.commit(next);
  }
  private assign(
    next: AuthDatabase,
    id: string,
    ids: string[],
    adminId: string,
  ) {
    if (ids.some((p) => !this.projectExists(p)))
      throw new Error("One of these projects no longer exists.");
    const stamp = new Date().toISOString();
    next.memberships
      .filter((m) => m.userId === id)
      .forEach((m) => {
        m.status = ids.includes(m.projectId) ? "active" : "revoked";
        if (m.status === "active") {
          m.grantedAt = stamp;
          m.grantedBy = adminId;
        }
      });
    for (const projectId of new Set(ids))
      if (
        !next.memberships.some(
          (m) => m.userId === id && m.projectId === projectId,
        )
      )
        next.memberships.push({
          id: newId(),
          userId: id,
          projectId,
          grantedAt: stamp,
          grantedBy: adminId,
          status: "active",
        });
    next.requests
      .filter(
        (r) =>
          r.userId === id &&
          r.status === "pending" &&
          ids.includes(r.projectId),
      )
      .forEach((r) => {
        r.status = "approved";
        r.resolvedAt = stamp;
        r.resolvedBy = adminId;
      });
  }
  setSiteAccess(id: string, projectIds: string[]) {
    const admin = this.admin();
    if (
      !this.db.users.some(
        (u) => u.id === id && u.role === "employee" && u.status === "approved",
      )
    )
      throw new Error("Approve this employee before assigning sites.");
    const next = structuredClone(this.db);
    this.assign(next, id, projectIds, admin.id);
    this.commit(next);
  }
  requestSite(projectId: string, message: string) {
    const u = this.employee();
    if (!this.projectExists(projectId))
      throw new Error("This site no longer exists.");
    if (
      u.role === "super_admin" ||
      this.db.memberships.some(
        (m) =>
          m.userId === u.id &&
          m.projectId === projectId &&
          m.status === "active",
      )
    )
      throw new Error("You already have access to this site.");
    if (
      this.db.requests.some(
        (r) =>
          r.userId === u.id &&
          r.projectId === projectId &&
          r.status === "pending",
      )
    )
      throw new Error("A request for this site is already pending.");
    this.commit({
      ...this.db,
      requests: [
        ...this.db.requests,
        {
          id: newId(),
          userId: u.id,
          projectId,
          requestedAt: new Date().toISOString(),
          status: "pending",
          resolvedAt: null,
          resolvedBy: null,
          optionalMessage: message.trim(),
        },
      ],
    });
  }
  resolveRequest(id: string, approve: boolean) {
    const admin = this.admin();
    const next = structuredClone(this.db);
    const r = next.requests.find((r) => r.id === id);
    if (!r || r.status !== "pending")
      throw new Error("This request has already been resolved.");
    if (approve) {
      if (!next.users.some((u) => u.id === r.userId && u.status === "approved"))
        throw new Error("Approve or reactivate the employee first.");
      const ids = next.memberships
        .filter((m) => m.userId === r.userId && m.status === "active")
        .map((m) => m.projectId);
      this.assign(next, r.userId, [...ids, r.projectId], admin.id);
    }
    r.status = approve ? "approved" : "rejected";
    r.resolvedAt = new Date().toISOString();
    r.resolvedBy = admin.id;
    this.commit(next);
  }
}
