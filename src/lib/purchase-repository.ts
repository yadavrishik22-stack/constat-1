import { z } from "zod";
import { newId } from "./id";
import {
  CONSTAT_SETUP_AMOUNT,
  PurchaseForm,
  PurchaseRequest,
  purchaseFormSchema,
  purchaseRequestSchema,
} from "./purchase-models";
import { StorageAdapter } from "./repository";

export const PURCHASE_KEY = "constat.purchase-requests.v1";
const purchaseStoreSchema = z.object({
  version: z.literal(1),
  requests: z.array(purchaseRequestSchema),
});

export class PurchaseRequestRepository {
  private requests: PurchaseRequest[] = [];
  private listeners = new Set<() => void>();

  constructor(private storage: StorageAdapter) {}

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.requests;

  private emit() {
    this.listeners.forEach((listener) => listener());
  }

  hydrate() {
    const raw = this.storage.read();
    this.requests = raw
      ? purchaseStoreSchema.parse(JSON.parse(raw)).requests
      : [];
    this.emit();
  }

  private commit(requests: PurchaseRequest[]) {
    const next = purchaseStoreSchema.parse({ version: 1, requests });
    try {
      this.storage.write(JSON.stringify(next));
    } catch {
      throw new Error(
        "Browser storage is full or unavailable. Your request was not saved.",
      );
    }
    this.requests = next.requests;
    this.emit();
  }

  create(input: PurchaseForm) {
    const form = purchaseFormSchema.parse(input);
    const stamp = new Date().toISOString();
    const request: PurchaseRequest = {
      ...form,
      projectCount: form.projectCount ?? null,
      notes: "",
      amount: CONSTAT_SETUP_AMOUNT,
      paymentStatus: "pending_payment",
      transactionReference: null,
      paidAt: null,
      id: newId(),
      status: "new",
      createdAt: stamp,
      updatedAt: stamp,
    };
    this.commit([...this.requests, request]);
    return request;
  }

  completeDemoPayment(id: string, transactionReference: string) {
    if (!this.requests.some((request) => request.id === id))
      throw new Error("Purchase request not found.");
    const stamp = new Date().toISOString();
    this.commit(
      this.requests.map((request) =>
        request.id === id
          ? {
              ...request,
              paymentStatus: "payment_successful" as const,
              transactionReference,
              paidAt: stamp,
              updatedAt: stamp,
            }
          : request,
      ),
    );
  }

  setStatus(id: string, status: PurchaseRequest["status"]) {
    if (!this.requests.some((request) => request.id === id))
      throw new Error("Purchase request not found.");
    const stamp = new Date().toISOString();
    this.commit(
      this.requests.map((request) =>
        request.id === id ? { ...request, status, updatedAt: stamp } : request,
      ),
    );
  }
}
