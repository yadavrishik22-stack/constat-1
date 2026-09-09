import Link from "next/link";
import {
  ArrowRight,
  Check,
  CircleAlert,
  Fuel,
  Hammer,
  Package,
  Users,
  Wallet,
} from "lucide-react";
import { HeroGraphic } from "@/components/hero-graphic";
import { LandingNav } from "@/components/landing-nav";
import { PublicBrand } from "@/components/public-brand";

const features = [
  [Fuel, "Machinery", "Track diesel and machine records."],
  [Users, "Workforce", "Record employees and labour."],
  [Package, "Materials", "Know what came in and what was used."],
  [Wallet, "Site Costs", "Track basic site expenses."],
  [Hammer, "Daily Work", "Record daily construction activity."],
  [CircleAlert, "Issues", "Report breakdowns and problems."],
] as const;

export default function Landing() {
  return (
    <div className="landing light-landing">
      <LandingNav />
      <main id="main-content">
        <section className="light-hero">
          <div className="light-hero-copy">
            <span className="eyebrow">CONSTRUCTION OPERATIONS, SIMPLIFIED</span>
            <h1>
              Construction tracking, <span>made simple.</span>
            </h1>
            <p>
              Track your site, workforce, materials and expenses in one place.
            </p>
            <div className="light-hero-actions">
              <Link href="/buy" className="btn btn-primary">
                Buy ConStat <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          <HeroGraphic priority />
        </section>

        <section id="features" className="landing-section light-features">
          <div className="light-section-heading">
            <span className="eyebrow">WHAT CONSTAT TRACKS</span>
            <h2>Everything happening on site. One place.</h2>
          </div>
          <div className="light-feature-grid">
            {features.map(([Icon, title, copy]) => (
              <article key={title}>
                <Icon size={22} strokeWidth={1.6} />
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section light-benefits">
          <div>
            <span className="eyebrow">WHY CONSTAT</span>
            <h2>A clear view of every site.</h2>
            <p>Keep daily records organized and easy to understand.</p>
          </div>
          <ul>
            {[
              "Know what happened on site today",
              "Replace scattered registers and sheets",
              "Track site costs and material usage",
              "See each project separately",
            ].map((item) => (
              <li key={item}>
                <Check size={17} />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="landing-section product-view">
          <div className="product-view-graphic">
            <HeroGraphic />
          </div>
          <div>
            <span className="eyebrow">BUILT FOR DAILY SITE WORK</span>
            <h2>
              Simple updates.
              <br />
              Useful statistics.
            </h2>
            <p>
              Your team records the day. Management sees the complete picture.
            </p>
          </div>
        </section>

        <section className="landing-section light-cta">
          <div>
            <span className="eyebrow">GET CONSTAT</span>
            <h2>Run your site with better visibility.</h2>
            <p>Keep your construction records in one simple system.</p>
          </div>
          <Link href="/buy" className="btn btn-primary">
            Buy ConStat <ArrowRight size={18} />
          </Link>
        </section>
      </main>
      <footer className="landing-footer">
        <div>
          <PublicBrand />
          <p>Construction Statistics Tracker</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#features">Features</a>
          <Link href="/login">Login</Link>
          <Link href="/signup">Sign Up</Link>
          <Link href="/buy">Buy ConStat</Link>
        </nav>
        <small>© {new Date().getFullYear()} ConStat</small>
      </footer>
    </div>
  );
}
