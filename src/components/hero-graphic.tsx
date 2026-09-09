const modules = [
  "Diesel",
  "Labour",
  "Materials",
  "Stores",
  "Accounts",
  "Issues",
];

export function HeroGraphic() {
  return (
    <div
      className="hero-graphic"
      aria-label="ConStat construction operations graphic"
    >
      <div className="graphic-glow" />
      <svg
        className="site-line-art"
        viewBox="0 0 900 520"
        role="img"
        aria-label="Abstract crane and construction structure"
      >
        <g fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M65 390H835M120 390V214H420V390M160 390V254H385V390M445 390V165H765V390M486 390V215H724V390" />
          <path d="M90 214H450M136 254H408M445 165H790M475 215H742" />
          <path d="M185 214V390M250 214V390M315 214V390M520 165V390M595 165V390M670 165V390" />
          <path d="M185 214L250 254L315 214L385 254M486 215L595 165L724 215M445 165L595 96V390M595 96H824M595 96L670 126M824 96L770 122" />
          <path d="M112 390L85 456H805L778 390M104 414H787M96 436H796" />
          <path d="M612 96V66M625 66H580M580 66V82" />
        </g>
      </svg>
      <div className="graphic-frame">
        <span className="frame-index">CS / 01</span>
        <span className="frame-status">
          <i /> SITE OPERATIONS LIVE
        </span>
        <div className="graphic-wordmark">
          <span className="wordmark-rule" />
          <strong>CONSTAT</strong>
          <small>CONSTRUCTION STATISTICS TRACKER</small>
        </div>
        <div className="module-chips">
          {modules.map((module) => (
            <span key={module}>{module}</span>
          ))}
        </div>
        <div className="graphic-stat stat-one">
          <small>WORKFORCE</small>
          <strong>67</strong>
          <span>ON SITE</span>
        </div>
        <div className="graphic-stat stat-two">
          <small>DIESEL</small>
          <strong>142 L</strong>
          <span>TODAY</span>
        </div>
        <div className="graphic-bars" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  );
}
