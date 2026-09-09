export function HeroGraphic() {
  return (
    <div
      className="simple-hero-graphic"
      aria-label="Construction site and statistics illustration"
    >
      <svg
        className="simple-site-drawing"
        viewBox="0 0 720 420"
        role="img"
        aria-label="Line drawing of a crane and building under construction"
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M88 346h548M145 346V205h260v141M184 346V240h183v106" />
          <path d="M145 205h285M184 240h183M222 205v141M290 205v141M358 205v141" />
          <path d="M222 205l68 35 68-35M184 240l38 32 68-32 68 32" />
          <path d="M450 346V116M450 116h186M450 116l-88 89M486 116l-36-29M636 116l-47 26" />
          <path d="M466 87h-32M434 87v29M145 346l-26 43h442l-24-43M132 369h416" />
        </g>
      </svg>
      <div className="simple-indicator indicator-diesel">
        <span>Diesel</span>
        <strong>142 L</strong>
      </div>
      <div className="simple-indicator indicator-workforce">
        <span>Workforce</span>
        <strong>67</strong>
      </div>
      <div className="simple-indicator indicator-materials">
        <span>Materials</span>
        <strong>Updated</strong>
      </div>
      <div className="simple-chart" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
