"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useStore } from "./store";
import { Button, Modal } from "./ui";
import { useState } from "react";
import { UserRound } from "lucide-react";
export function AccountMenu() {
  const { user, role, auth } = useStore();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <button
        className="account-trigger"
        aria-label="Open account menu"
        onClick={() => setOpen(true)}
      >
        <UserRound size={18} />
        <span>{user?.fullName}</span>
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={user?.fullName ?? "Your account"}
        description={`${role} · ${user?.email}`}
      >
        <div className="account-menu-content">
          <Link
            className="btn btn-secondary"
            href="/my-sites"
            onClick={() => setOpen(false)}
          >
            My Sites
          </Link>
          <Button
            onClick={() => {
              try {
                auth.logout();
                router.replace("/login");
              } catch {
                toast.error("Could not clear the session. Please try again.");
              }
            }}
          >
            Logout
          </Button>
        </div>
      </Modal>
    </>
  );
}
