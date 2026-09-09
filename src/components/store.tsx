"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { BrowserStorage, Repository, STORAGE_KEY } from "@/lib/repository";
import { AuthRepository, AUTH_KEY, SESSION_KEY } from "@/lib/auth-repository";
import {
  PURCHASE_KEY,
  PurchaseRequestRepository,
} from "@/lib/purchase-repository";
import { createSeed, samplePhoto } from "@/lib/seed";
import { toast } from "sonner";
const Context = createContext<{
  repo: Repository;
  auth: AuthRepository;
  purchases: PurchaseRequestRepository;
  ready: boolean;
  error: string;
  authError: string;
  clearError: () => void;
  selection: { companyId: string; projectId: string };
  selectWorkspace: (companyId: string, projectId: string) => void;
} | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [services] = useState(() => {
    const repo = new Repository(new BrowserStorage());
    const auth = new AuthRepository(
      new BrowserStorage(AUTH_KEY),
      new BrowserStorage(SESSION_KEY),
      (id) => repo.projectExists(id),
    );
    const purchases = new PurchaseRequestRepository(
      new BrowserStorage(PURCHASE_KEY),
    );
    repo.setAccessProvider(auth.getAccess);
    return { repo, auth, purchases };
  });
  const { repo, auth, purchases } = services;
  const [preferences] = useState(
    () => new BrowserStorage("constat.workspace.v1"),
  );
  const [selection, setSelection] = useState({ companyId: "", projectId: "" });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState("");
  function selectWorkspace(companyId: string, projectId: string) {
    if (
      projectId &&
      !repo
        .getSnapshot()
        .projects.some((p) => p.id === projectId && p.companyId === companyId)
    ) {
      toast.error("This site is not assigned to you.");
      return;
    }
    setSelection({ companyId, projectId });
    try {
      preferences.write(JSON.stringify({ companyId, projectId }));
    } catch {
      toast.error("Selection could not be remembered.");
    }
  }
  useEffect(() => {
    let active = true;
    const unsubscribe = auth.subscribe(repo.refreshAccess);
    const initialize = async () => {
      try {
        repo.hydrate(() => createSeed(samplePhoto(), samplePhoto("bill")));
      } catch (e) {
        if (active)
          setError(
            `Saved operational data could not be loaded and has not been overwritten. ${e instanceof Error ? e.message : ""}`,
          );
      }
      try {
        const saved = JSON.parse(preferences.read() ?? "null");
        if (
          active &&
          typeof saved?.companyId === "string" &&
          typeof saved?.projectId === "string"
        )
          setSelection(saved);
      } catch {
        /* Selection is optional. */
      }
      try {
        await auth.hydrate(repo.initialDemoProjectId());
      } catch (e) {
        if (active)
          setAuthError(
            `Could not open local accounts. Saved data has not been overwritten. ${e instanceof Error ? e.message : ""}`,
          );
      }
      try {
        purchases.hydrate();
      } catch {
        toast.error("Saved purchase requests could not be loaded.");
      }
      if (active) setReady(true);
    };
    void initialize();
    const handler = (event: StorageEvent) => {
      try {
        if (event.key === STORAGE_KEY || event.key === null) repo.reload();
        if (
          event.key === AUTH_KEY ||
          event.key === SESSION_KEY ||
          event.key === null
        )
          auth.reload();
        if (event.key === PURCHASE_KEY || event.key === null)
          purchases.hydrate();
      } catch {
        toast.error(
          "Saved data changed in another tab but could not be loaded.",
        );
      }
    };
    window.addEventListener("storage", handler);
    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener("storage", handler);
    };
  }, [repo, auth, purchases, preferences]);
  return (
    <Context.Provider
      value={{
        repo,
        auth,
        purchases,
        ready,
        error,
        authError,
        clearError: () => setError(""),
        selection,
        selectWorkspace,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Store unavailable.");
  const db = useSyncExternalStore(
    ctx.repo.subscribe,
    ctx.repo.getSnapshot,
    ctx.repo.getSnapshot,
  );
  const account = useSyncExternalStore(
    ctx.auth.subscribe,
    ctx.auth.getSnapshot,
    ctx.auth.getSnapshot,
  );
  const purchaseRequests = useSyncExternalStore(
    ctx.purchases.subscribe,
    ctx.purchases.getSnapshot,
    ctx.purchases.getSnapshot,
  );
  const role =
    account.user?.role === "super_admin"
      ? ("Super Admin" as const)
      : ("Employee" as const);
  return { ...ctx, db, ...account, purchaseRequests, role };
}
