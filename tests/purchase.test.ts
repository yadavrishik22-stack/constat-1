import { describe, expect, it } from "vitest";
import { PurchaseRequestRepository } from "../src/lib/purchase-repository";
import { StorageAdapter } from "../src/lib/repository";

class MemoryStorage implements StorageAdapter {
  value: string | null = null;
  fail = false;
  read() {
    return this.value;
  }
  write(value: string) {
    if (this.fail) throw new Error("quota");
    this.value = value;
  }
}

const request = {
  companyName: "Build Right Constructions",
  fullName: "Ravi Kumar",
  email: "RAVI@EXAMPLE.COM",
  phone: "+91 98765 43210",
  projectCount: 3,
  notes: "Three active sites",
};

describe("Purchase request repository", () => {
  it("persists, normalizes and updates a purchase request", () => {
    const storage = new MemoryStorage();
    const repo = new PurchaseRequestRepository(storage);
    repo.hydrate();
    const saved = repo.create(request);
    expect(saved.email).toBe("ravi@example.com");
    expect(saved.status).toBe("new");

    const restored = new PurchaseRequestRepository(storage);
    restored.hydrate();
    expect(restored.getSnapshot()).toHaveLength(1);
    restored.setStatus(saved.id, "contacted");
    expect(restored.getSnapshot()[0].status).toBe("contacted");
  });

  it("rejects invalid input and leaves saved requests intact on quota failure", () => {
    const storage = new MemoryStorage();
    const repo = new PurchaseRequestRepository(storage);
    repo.hydrate();
    expect(() => repo.create({ ...request, phone: "12" })).toThrow();
    const saved = repo.create(request);
    const before = storage.value;
    storage.fail = true;
    expect(() => repo.setStatus(saved.id, "closed")).toThrow(/not saved/);
    expect(storage.value).toBe(before);
    expect(repo.getSnapshot()[0].status).toBe("new");
  });
});
