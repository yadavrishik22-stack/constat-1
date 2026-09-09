"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Fuel,
  Truck,
  Users,
  HardHat,
  Package,
  Layers,
  FolderKanban,
  Database,
  PanelLeftClose,
  Menu,
  ChevronRight,
  Building2,
  X,
  ClipboardCheck,
  Warehouse,
  NotebookPen,
  Wallet,
  CircleAlert,
  Weight,
  Boxes,
  ShoppingBag,
} from "lucide-react";
import { useStore } from "./store";
import { Dashboard, InventoryPage } from "./dashboard";
import { RecordsPage } from "./records";
import { AttendancePage } from "./attendance";
import { DataManagement, ProjectsPage } from "./management";
import { OperationsModule } from "./operations";
import { AccountMenu } from "./account-menu";
import { MySites, UserManagement } from "./site-access";
import { PurchaseRequestsPage } from "./purchase-requests";
import { PublicBrand } from "./public-brand";
import { Empty } from "./ui";
const groups = [
  {
    label: "",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "MACHINERY",
    items: [
      { href: "/diesel", label: "Diesel Log", icon: Fuel },
      { href: "/machinery", label: "Machinery", icon: Truck },
    ],
  },
  {
    label: "ATTENDANCE",
    items: [
      { href: "/employees", label: "Technical Employees", icon: Users },
      { href: "/attendance", label: "Daily Attendance", icon: ClipboardCheck },
      { href: "/labour", label: "Labour Attendance", icon: HardHat },
    ],
  },
  {
    label: "MATERIALS",
    items: [
      { href: "/materials", label: "Material Log", icon: Package },
      { href: "/inventory", label: "Inventory", icon: Layers },
      { href: "/steel", label: "Steel Consumption", icon: Weight },
      { href: "/concrete", label: "Concrete Consumption", icon: Boxes },
    ],
  },
  {
    label: "SITE OPERATIONS",
    items: [
      { href: "/stores", label: "Stores", icon: Warehouse },
      { href: "/work", label: "Daily Work", icon: NotebookPen },
      { href: "/accounts", label: "Site Accounts", icon: Wallet },
      { href: "/issues", label: "Reports / Issues", icon: CircleAlert },
    ],
  },
  {
    label: "WORKSPACE",
    items: [
      { href: "/my-sites", label: "My Sites", icon: Building2 },
      { href: "/users", label: "User Management", icon: Users },
      {
        href: "/purchase-requests",
        label: "Purchase Requests",
        icon: ShoppingBag,
      },
      { href: "/projects", label: "Projects", icon: FolderKanban },
      { href: "/data", label: "Data Management", icon: Database },
    ],
  },
];
export function AppShell() {
  const { db, ready, error, selection, selectWorkspace, role } = useStore();
  const pathname = usePathname();
  const { companyId: selectedCompany, projectId: selectedProject } = selection;
  const [mobileOpen, setMobileOpen] = useState(false);
  const companyId = db.companies.some((c) => c.id === selectedCompany)
    ? selectedCompany
    : (db.companies[0]?.id ?? "");
  const projects = db.projects.filter((p) => p.companyId === companyId);
  const projectId = projects.some((p) => p.id === selectedProject)
    ? selectedProject
    : (projects[0]?.id ?? "");
  const current = groups
    .flatMap((g) => g.items)
    .find((i) => i.href === pathname);
  const selectCompany = (id: string) => {
    selectWorkspace(id, "");
  };
  const setProject = (id: string) => selectWorkspace(companyId, id);
  if (!ready)
    return (
      <div className="loading">
        <PublicBrand href="/dashboard" ariaLabel="ConStat dashboard" />
        <p>Opening ConStat…</p>
      </div>
    );
  const props = { projectId, companyId };
  const content =
    pathname === "/purchase-requests" && role === "Super Admin" ? (
      <PurchaseRequestsPage />
    ) : pathname === "/users" && role === "Super Admin" ? (
      <UserManagement />
    ) : pathname === "/my-sites" ? (
      <MySites />
    ) : pathname === "/data" && role === "Super Admin" ? (
      <DataManagement />
    ) : pathname === "/projects" && role === "Super Admin" ? (
      <ProjectsPage
        {...props}
        onSelectCompany={selectCompany}
        onSelectProject={setProject}
      />
    ) : !projectId ? (
      <Empty
        title={
          role === "Employee"
            ? "No construction sites assigned yet"
            : "Create your first project"
        }
        description={
          role === "Employee"
            ? "You can request access to a construction site or contact your administrator."
            : "Add a company and construction site to start tracking operations."
        }
        action={
          <Link
            className="btn btn-primary"
            href={role === "Employee" ? "/my-sites" : "/projects"}
          >
            {role === "Employee" ? "View Available Sites" : "Set up a project"}
          </Link>
        }
      />
    ) : pathname === "/dashboard" ? (
      <Dashboard projectId={projectId} />
    ) : pathname === "/inventory" ? (
      <InventoryPage projectId={projectId} />
    ) : pathname === "/attendance" ? (
      <AttendancePage projectId={projectId} />
    ) : pathname === "/diesel" ? (
      <RecordsPage kind="diesel" {...props} />
    ) : pathname === "/machinery" ? (
      <RecordsPage kind="machines" {...props} />
    ) : pathname === "/employees" ? (
      <RecordsPage kind="employees" {...props} />
    ) : pathname === "/labour" ? (
      <RecordsPage kind="labour" {...props} />
    ) : pathname === "/steel" ? (
      <RecordsPage kind="transactions" steelOnly {...props} />
    ) : ["/stores", "/work", "/accounts", "/issues", "/concrete"].includes(
        pathname,
      ) ? (
      <OperationsModule
        module={
          pathname.slice(1) as
            "stores" | "work" | "accounts" | "issues" | "concrete"
        }
        {...props}
      />
    ) : pathname === "/materials" ? (
      <RecordsPage kind="transactions" {...props} />
    ) : (
      <Empty
        title="Page not found"
        action={<Link href="/dashboard">Go to dashboard</Link>}
      />
    );
  return (
    <div className="app-shell">
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? "is-open" : ""}`}>
        <PublicBrand
          href="/dashboard"
          ariaLabel="ConStat dashboard"
          className="brand"
          showBeta
        />
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>
        <div className="workspace-label">
          <Building2 size={17} />
          <span>Site workspace</span>
          <span className="workspace-dot" />
        </div>
        <nav aria-label="Main navigation">
          {groups.map((g) => (
            <div className="nav-group" key={g.label}>
              {g.label && <span className="nav-group-label">{g.label}</span>}
              {g.items
                .filter(
                  (item) =>
                    role === "Super Admin" ||
                    ![
                      "/users",
                      "/purchase-requests",
                      "/projects",
                      "/data",
                    ].includes(item.href),
                )
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={
                      pathname === item.href ? "nav-link active" : "nav-link"
                    }
                    aria-current={pathname === item.href ? "page" : undefined}
                  >
                    <item.icon size={18} />
                    {item.label}
                    {pathname === item.href && <ChevronRight size={14} />}
                  </Link>
                ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="local-badge">
            <span />
            Local workspace
          </div>
          <p>Simple records. Clear decisions.</p>
          <div className="sidebar-version">
            ConStat V1 beta
            <PanelLeftClose size={15} />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={21} />
            </button>
            <PublicBrand
              href="/dashboard"
              className="mobile-header-brand"
              ariaLabel="ConStat dashboard"
            />
            <span className="desktop-breadcrumb">Workspace</span>
            <ChevronRight className="desktop-breadcrumb" size={14} />
            <strong className="desktop-breadcrumb">
              {current?.label ?? "ConStat"}
            </strong>
          </div>
          <div className="topbar-right">
            <AccountMenu />
          </div>
        </header>
        <div className="project-bar">
          <Building2 size={19} />
          <label>
            <span>Company</span>
            <select
              aria-label="Current company"
              value={companyId}
              onChange={(e) => selectCompany(e.target.value)}
            >
              {!companyId && <option value="">No company</option>}
              {db.companies.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <span className="project-divider" />
          <label className="project-selector">
            <span>Current project</span>
            <select
              aria-label="Current project"
              value={projectId}
              onChange={(e) => setProject(e.target.value)}
            >
              {!projectId && <option value="">No project selected</option>}
              {projects.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.name} — {p.location}
                </option>
              ))}
            </select>
          </label>
          {role === "Super Admin" && (
            <Link href="/projects" className="manage-projects">
              Manage projects <ChevronRight size={14} />
            </Link>
          )}
        </div>
        <main key={`${pathname}:${projectId}:${role}`} id="main-content">
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
          {content}
          <footer className="page-footer">
            <span>ConStat · Construction Statistics Tracker</span>
            <span>Local beta / V1.0</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
