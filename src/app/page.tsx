import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleAlert,
  Fuel,
  Package,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";
import { HeroGraphic } from "@/components/hero-graphic";
import { LandingNav } from "@/components/landing-nav";
import { PublicBrand } from "@/components/public-brand";

const features = [
  [
    Fuel,
    "Diesel & Machinery",
    "Track diesel filled, meter readings and bills.",
  ],
  [Users, "Workforce", "Record technical attendance and labour count."],
  [Package, "Materials", "See received, consumed and current stock."],
  [Warehouse, "Stores", "Track equipment and daily usage."],
  [Wallet, "Site Accounts", "Keep site expenses and receipts together."],
  [CircleAlert, "Reports & Issues", "Record problems and their resolution."],
] as const;

export default function Landing() {
  return (
    <div className="landing">
      <LandingNav />
      <main id="main-content">
        <section className="landing-hero graphic-hero">
          <div className="hero-grid" />
          <div className="hero-content">
            <div className="hero-copy">
              <span className="eyebrow">
                <span className="hero-dot" /> CONSTRUCTION OPERATIONS, CONNECTED
              </span>
              <h1>
                Construction tracking, <span>made simple.</span>
              </h1>
              <p>
                Track diesel, labour, materials, work, site expenses and issues
                in one place.
              </p>
              <div className="hero-actions">
                <Link href="/buy" className="btn hero-primary">
                  Buy Now <ArrowUpRight size={19} />
                </Link>
                <Link href="/login" className="hero-login">
                  Login <ArrowRight size={18} />
                </Link>
                <Link href="/signup" className="hero-signup">
                  Sign Up
                </Link>
              </div>
              <div className="hero-price">
                <strong>₹25,999</strong>
                <span>
                  One ConStat setup
                  <br />
                  for your company
                </span>
              </div>
            </div>
            <HeroGraphic />
          </div>
        </section>

        <section id="features" className="landing-section compact-features">
          <div className="section-intro">
            <div>
              <span className="eyebrow">WHAT CONSTAT TRACKS</span>
              <h2>
                Everything your site team
                <br />
                updates every day.
              </h2>
            </div>
            <p>Simple records in. Clear site statistics out.</p>
          </div>
          <div className="landing-feature-grid">
            {features.map(([Icon, title, copy]) => (
              <article key={title}>
                <Icon size={24} strokeWidth={1.5} />
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section simple-benefits">
          <div>
            <span className="eyebrow">ONE OPERATIONAL VIEW</span>
            <h2>
              Know what is happening
              <br />
              on every site.
            </h2>
          </div>
          <ul>
            {[
              "Know what happened on site today",
              "Replace scattered registers and sheets",
              "Track site costs and material usage",
              "Improve visibility across projects",
            ].map((benefit) => (
              <li key={benefit}>
                <Check size={18} />
                {benefit}
              </li>
            ))}
          </ul>
        </section>

        <section id="pricing" className="landing-section pricing-section">
          <div className="pricing-copy">
            <span className="eyebrow">SIMPLE PRICING</span>
            <h2>
              One ConStat setup.
              <br />
              One clear price.
            </h2>
            <p>Track daily site operations in one centralized system.</p>
          </div>
          <article className="pricing-card">
            <div>
              <PublicBrand />
              <span className="pricing-label">COMPANY SETUP</span>
            </div>
            <strong className="price">₹25,999</strong>
            <p>For your construction company</p>
            <ul>
              {[
                "Project-wise tracking",
                "Workforce visibility",
                "Diesel and material records",
                "Site expenses and issue reporting",
              ].map((item) => (
                <li key={item}>
                  <Check size={16} />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/buy" className="btn btn-primary">
              Buy Now <ArrowUpRight size={18} />
            </Link>
            <small>No payment gateway yet. Submit a setup request.</small>
          </article>
        </section>

        <section className="landing-section landing-cta">
          <span className="eyebrow">READY FOR A CLEARER SITE VIEW?</span>
          <h2>
            Start using ConStat
            <br />
            for your site operations.
          </h2>
          <div>
            <Link href="/buy" className="btn btn-primary">
              Buy Now <ArrowUpRight size={18} />
            </Link>
            <Link href="/signup" className="btn btn-secondary">
              Sign Up
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <div>
          <PublicBrand />
          <p>Construction Statistics Tracker</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <Link href="/login">Login</Link>
          <Link href="/signup">Sign Up</Link>
          <Link href="/buy">Buy Now</Link>
        </nav>
        <small>© {new Date().getFullYear()} ConStat</small>
      </footer>
    </div>
  );
}
