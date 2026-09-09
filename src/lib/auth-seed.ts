import { AuthDatabase } from "./auth-models";
import { hashPassword } from "./passwords";
export const demoAccounts = [
  {
    id: "user-demo-admin",
    fullName: "ConStat Admin",
    email: "admin@constat.in",
    username: "superadmin",
    password: "Admin@123",
    role: "super_admin" as const,
  },
  {
    id: "user-demo-employee",
    fullName: "Site Employee",
    email: "employee@constat.in",
    username: "siteemployee",
    password: "Employee@123",
    role: "employee" as const,
  },
];
export async function seedAccounts(projectId: string): Promise<AuthDatabase> {
  const stamp = new Date().toISOString();
  const users = await Promise.all(
    demoAccounts.map(async ({ password, ...u }) => ({
      ...u,
      passwordHash: await hashPassword(password),
      status: "approved" as const,
      createdAt: stamp,
      updatedAt: stamp,
      approvedAt: stamp,
      approvedBy: "user-demo-admin",
    })),
  );
  return {
    version: 1,
    users,
    memberships: projectId
      ? [
          {
            id: "membership-demo",
            userId: "user-demo-employee",
            projectId,
            grantedAt: stamp,
            grantedBy: "user-demo-admin",
            status: "active",
          },
        ]
      : [],
    requests: [],
  };
}
