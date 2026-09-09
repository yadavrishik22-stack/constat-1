import { z } from "zod";
export const userSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9_.-]+$/),
  passwordHash: z.string().min(1),
  role: z.enum(["super_admin", "employee"]),
  status: z.enum(["pending", "approved", "rejected", "inactive"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  approvedAt: z.string().nullable(),
  approvedBy: z.string().nullable(),
});
export const membershipSchema = z.object({
  id: z.string(),
  userId: z.string(),
  projectId: z.string(),
  grantedAt: z.string(),
  grantedBy: z.string(),
  status: z.enum(["active", "revoked"]),
});
export const requestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  projectId: z.string(),
  requestedAt: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
  resolvedAt: z.string().nullable(),
  resolvedBy: z.string().nullable(),
  optionalMessage: z.string().max(500),
});
export const authDatabaseSchema = z.object({
  version: z.literal(1),
  users: z.array(userSchema),
  memberships: z.array(membershipSchema),
  requests: z.array(requestSchema),
});
export const signupSchema = userSchema
  .pick({ fullName: true, email: true, username: true })
  .extend({
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(128)
      .regex(/[A-Z]/, "Include an uppercase letter.")
      .regex(/[a-z]/, "Include a lowercase letter.")
      .regex(/[0-9]/, "Include a number."),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });
export type LocalUser = z.infer<typeof userSchema>;
export type PublicUser = Omit<LocalUser, "passwordHash">;
export type AuthDatabase = z.infer<typeof authDatabaseSchema>;
export type Membership = z.infer<typeof membershipSchema>;
export type SiteRequest = z.infer<typeof requestSchema>;
export type Access = {
  role: "Super Admin" | "Employee";
  projectIds: string[];
} | null;
export const publicUser = ({
  passwordHash: _hash,
  ...user
}: LocalUser): PublicUser => {
  void _hash;
  return user;
};
