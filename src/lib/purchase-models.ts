import { z } from "zod";

export const purchaseRequestSchema = z.object({
  id: z.string().min(1),
  companyName: z.string().trim().min(2).max(120),
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s()-]{7,19}$/, "Enter a valid phone number."),
  projectCount: z.number().int().min(1).max(1000).nullable(),
  notes: z.string().trim().max(1000),
  status: z.enum(["new", "contacted", "closed"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const purchaseFormSchema = purchaseRequestSchema
  .pick({
    companyName: true,
    fullName: true,
    email: true,
    phone: true,
    notes: true,
  })
  .extend({
    projectCount: z.preprocess(
      (value) => (value === "" || value === undefined ? undefined : value),
      z.coerce.number().int().min(1).max(1000).optional(),
    ),
  });

export type PurchaseRequest = z.infer<typeof purchaseRequestSchema>;
export type PurchaseForm = z.infer<typeof purchaseFormSchema>;
