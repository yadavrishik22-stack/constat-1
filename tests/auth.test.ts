import { describe, it, expect } from "vitest";
import { AuthRepository } from "../src/lib/auth-repository";
import { Repository, StorageAdapter } from "../src/lib/repository";
import { createSeed } from "../src/lib/seed";
import { projectCollections } from "../src/lib/operations-integrity";
import { today } from "../src/lib/format";
import { signupSchema } from "../src/lib/auth-models";
class Memory implements StorageAdapter {
  value: string | null = null;
  fail = false;
  read() {
    return this.value;
  }
  write(v: string) {
    if (this.fail) throw new Error("quota");
    this.value = v;
  }
}
const photo =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF9sAAAAASUVORK5CYII=";
const signup = {
  fullName: "Test Employee",
  email: " testemployee@constat.in ",
  username: " TestEmployee ",
  password: "Test@1234",
  confirmPassword: "Test@1234",
};
async function setup() {
  const data = new Memory(),
    accounts = new Memory(),
    session = new Memory();
  const repo = new Repository(data);
  repo.hydrate(() => createSeed(photo));
  const auth = new AuthRepository(accounts, session, (id) =>
    repo.projectExists(id),
  );
  repo.setAccessProvider(auth.getAccess);
  auth.subscribe(repo.refreshAccess);
  await auth.hydrate(repo.initialDemoProjectId());
  return { repo, auth, data, accounts, session };
}
describe("Local account and site permission workflows", () => {
  it("preserves operational bytes, hashes passwords, supports both identifiers and refresh/logout", async () => {
    const { repo, auth, data, accounts, session } = await setup();
    const before = data.value;
    expect(repo.getSnapshot().diesel).toHaveLength(0);
    await auth.login(" ADMIN@CONSTAT.IN ", "Admin@123");
    expect(repo.getSnapshot().diesel.length).toBeGreaterThan(0);
    expect(data.value).toBe(before);
    expect(accounts.value).not.toContain("Admin@123");
    expect(accounts.value).not.toContain("Employee@123");
    expect(auth.getSnapshot().users[0]).not.toHaveProperty("passwordHash");
    const refreshed = new AuthRepository(accounts, session, (id) =>
      repo.projectExists(id),
    );
    await refreshed.hydrate("project-demo");
    expect(refreshed.getSnapshot().user?.role).toBe("super_admin");
    auth.logout();
    expect(repo.getSnapshot().projects).toHaveLength(0);
    await auth.login("siteemployee", "Employee@123");
    expect(repo.getSnapshot().projects.map((p) => p.id)).toEqual([
      "project-demo",
    ]);
    await expect(auth.login("siteemployee", "wrong")).rejects.toThrow(
      /incorrect/,
    );
  });
  it("validates signup, defaults to pending employee and prevents duplicate identities", async () => {
    const { auth, repo } = await setup();
    expect(
      signupSchema.safeParse({ ...signup, confirmPassword: "no" }).success,
    ).toBe(false);
    expect(
      signupSchema.safeParse({
        ...signup,
        password: "weak",
        confirmPassword: "weak",
      }).success,
    ).toBe(false);
    await auth.signup({ ...signup, role: "super_admin", status: "approved" });
    expect(auth.getSnapshot().user).toMatchObject({
      role: "employee",
      status: "pending",
      email: "testemployee@constat.in",
      username: "testemployee",
    });
    expect(repo.getSnapshot().projects).toHaveLength(0);
    expect(repo.getSiteDirectory()).toHaveLength(0);
    expect(() => repo.saveAttendance("project-demo", today(), [])).toThrow(
      /access/,
    );
    expect(() => auth.requestSite("project-demo", "")).toThrow(/approved/);
    await expect(auth.signup(signup)).rejects.toThrow(/email/);
    await expect(
      auth.signup({ ...signup, email: "different@constat.in" }),
    ).rejects.toThrow(/username/);
  });
  it("approves without sites, requests, grants, revokes and blocks every collection", async () => {
    const { auth, repo } = await setup();
    await auth.signup(signup);
    const id = auth.getSnapshot().user!.id;
    await auth.login("superadmin", "Admin@123");
    const all = repo.getSnapshot();
    repo.save("projects", {
      ...all.projects[0],
      id: "project-other",
      name: "Other Project",
    });
    // Every operational collection receives a second-site record for read isolation testing.
    const clone = structuredClone(repo.getSnapshot());
    for (const key of projectCollections) {
      const originals = all[key];
      const rows = originals.map((r) => {
        const result = {
          ...r,
          id: `other-${r.id}`,
          projectId: "project-other",
        };
        for (const field of [
          "machineId",
          "employeeId",
          "storeItemId",
          "activityId",
          "categoryId",
        ] as const)
          if (field in result && (result as Record<string, unknown>)[field])
            (result as Record<string, unknown>)[field] =
              `other-${(result as Record<string, unknown>)[field]}`;
        return result;
      });
      // Project defaults are replaced by copies to preserve reference integrity.
      (clone[key] as unknown[]) = [...originals, ...rows];
    }
    repo.replace(clone);
    auth.setStatus(id, "approved");
    await auth.login("testemployee", "Test@1234");
    expect(repo.getSnapshot().projects).toHaveLength(0);
    expect(repo.getSiteDirectory()).toHaveLength(2);
    auth.requestSite("project-demo", "Working on tower");
    expect(() => auth.requestSite("project-demo", "")).toThrow(/pending/);
    const request = auth.getSnapshot().requests[0].id;
    expect(() => auth.setSiteAccess(id, ["project-other"])).toThrow(
      /Super Admin/,
    );
    await auth.login("superadmin", "Admin@123");
    auth.resolveRequest(request, true);
    await auth.login("testemployee", "Test@1234");
    for (const key of projectCollections)
      expect(
        repo.getSnapshot()[key].every((r) => r.projectId === "project-demo"),
      ).toBe(true);
    expect(repo.getSnapshot().projects).toHaveLength(1);
    for (const key of projectCollections) {
      const other = clone[key].find((r) => r.projectId === "project-other")!;
      expect(() => repo.save(key, other)).toThrow();
      expect(() => repo.remove(key, other.id)).toThrow();
      // Existing inaccessible IDs cannot be smuggled into an allowed project.
      expect(() =>
        repo.save(key, { ...other, projectId: "project-demo" }),
      ).toThrow();
    }
    expect(() => repo.clearAttendance("project-other", today())).toThrow(
      /access/,
    );
    expect(() => repo.replace(all)).toThrow(/Super Admin/);
    await auth.login("superadmin", "Admin@123");
    auth.setSiteAccess(id, ["project-other"]);
    await auth.login("testemployee", "Test@1234");
    expect(repo.getSnapshot().projects.map((p) => p.id)).toEqual([
      "project-other",
    ]);
    expect(() => repo.saveAttendance("project-demo", today(), [])).toThrow(
      /access/,
    );
    await auth.login("superadmin", "Admin@123");
    auth.setSiteAccess(id, []);
    await auth.login("testemployee", "Test@1234");
    expect(repo.getSnapshot().diesel).toHaveLength(0);
  });
  it("rejects/deactivates without deleting history and rejects site requests", async () => {
    const { auth, repo, data } = await setup();
    const before = data.value;
    await auth.signup(signup);
    const id = auth.getSnapshot().user!.id;
    await auth.login("superadmin", "Admin@123");
    auth.setStatus(id, "rejected");
    await auth.login("testemployee", "Test@1234");
    expect(auth.getSnapshot().user?.status).toBe("rejected");
    expect(repo.getSnapshot().projects).toHaveLength(0);
    await auth.login("superadmin", "Admin@123");
    auth.setStatus(id, "approved", ["project-demo"]);
    auth.setSiteAccess(id, []);
    await auth.login("testemployee", "Test@1234");
    auth.requestSite("project-demo", "");
    const request = auth.getSnapshot().requests[0].id;
    await auth.login("superadmin", "Admin@123");
    auth.resolveRequest(request, false);
    auth.setStatus(id, "inactive");
    await auth.login("testemployee", "Test@1234");
    expect(auth.getSnapshot().requests[0].status).toBe("rejected");
    expect(auth.getAccess()).toBeNull();
    expect(data.value).toBe(before);
  });
  it("handles quota and corrupted auth data without replacing saved records", async () => {
    const { auth, accounts, data } = await setup();
    const original = accounts.value,
      before = data.value;
    accounts.fail = true;
    await expect(auth.signup(signup)).rejects.toThrow(/storage/);
    expect(accounts.value).toBe(original);
    accounts.fail = false;
    accounts.value = "invalid";
    expect(() => auth.reload()).toThrow();
    expect(auth.getSnapshot().user).toBeNull();
    expect(data.value).toBe(before);
  });
  it("applies access revocation when another tab refreshes its services", async () => {
    const { auth, accounts, repo } = await setup();
    await auth.signup(signup);
    const id = auth.getSnapshot().user!.id;
    await auth.login("superadmin", "Admin@123");
    auth.setStatus(id, "approved", ["project-demo"]);
    const employeeSession = new Memory();
    const other = new AuthRepository(accounts, employeeSession, (p) =>
      repo.projectExists(p),
    );
    await other.hydrate("project-demo");
    await other.login("testemployee", "Test@1234");
    expect(other.getAccess()?.projectIds).toContain("project-demo");
    auth.setSiteAccess(id, []);
    other.reload();
    expect(other.getAccess()?.projectIds).toEqual([]);
  });
});
