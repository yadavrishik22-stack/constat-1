import Link from "next/link";
export function PublicBrand() {
  return (
    <Link className="public-brand" href="/" aria-label="ConStat home">
      <span className="logo-mark" aria-hidden="true">
        C<span />
      </span>
      <span className="public-brand-copy">
        ConStat<small>CONSTRUCTION STATISTICS</small>
      </span>
    </Link>
  );
}
