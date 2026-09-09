"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { PublicBrand } from "./public-brand";
export function LandingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="landing-nav">
      <PublicBrand />
      <button
        className="landing-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="public-navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <nav
        id="public-navigation"
        className={open ? "open" : ""}
        aria-label="Public navigation"
      >
        <a href="#features" onClick={() => setOpen(false)}>
          Features
        </a>
        <a href="#pricing" onClick={() => setOpen(false)}>
          Pricing
        </a>
        <Link href="/login">Login</Link>
        <Link href="/signup">Sign Up</Link>
        <Link href="/buy" className="btn btn-primary">
          Buy Now <ArrowUpRight size={16} />
        </Link>
      </nav>
    </header>
  );
}
