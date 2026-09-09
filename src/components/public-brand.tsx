import Link from "next/link";

type PublicBrandProps = {
  href?: string;
  ariaLabel?: string;
  className?: string;
  showBeta?: boolean;
};

export function PublicBrand({
  href = "/",
  ariaLabel = "ConStat home",
  className = "",
  showBeta = false,
}: PublicBrandProps = {}) {
  return (
    <Link
      className={`public-brand ${className}`.trim()}
      href={href}
      aria-label={ariaLabel}
    >
      <span className="logo-mark" aria-hidden="true">
        C<span />
      </span>
      <span className="public-brand-copy">
        ConStat<small>CONSTRUCTION STATISTICS</small>
      </span>
      {showBeta && <span className="beta">BETA</span>}
    </Link>
  );
}
