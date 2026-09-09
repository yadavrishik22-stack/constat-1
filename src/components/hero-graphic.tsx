export function HeroGraphic() {
  return (
    <div
      className="simple-hero-graphic"
      aria-label="Construction crane, building and site statistics illustration"
    >
      <svg
        className="simple-site-drawing"
        viewBox="0 0 760 460"
        role="img"
        aria-label="Architectural line illustration of a tower crane and a building under construction"
      >
        <defs>
          <linearGradient id="buildingShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.04" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.13" />
          </linearGradient>
        </defs>
        <g className="site-grid" fill="none">
          <path d="M45 388H730M45 330H730M45 272H730M45 214H730" />
          <path d="M124 92V414M220 92V414M316 92V414M412 92V414M508 92V414M604 92V414" />
        </g>
        <g className="building-fill" fill="url(#buildingShade)">
          <path d="M242 229h317v181H242z" />
          <path d="M303 181h196v48H303z" />
        </g>
        <g className="building-lines" fill="none">
          <path d="M214 410h388M242 410V229h317v181M303 229v-48h196v48" />
          <path d="M242 274h317M242 319h317M242 364h317" />
          <path d="M294 229v181M347 229v181M400 229v181M453 229v181M506 229v181" />
          <path d="M303 181h196M326 181v48M378 181v48M430 181v48M478 181v48" />
          <path d="M226 410l-20 20h412l-16-20" />
          <path
            d="M256 274l38-45 53 45 53-45 53 45 53-45 53 45"
            opacity=".52"
          />
        </g>
        <g className="crane-lines" fill="none">
          <path d="M579 410V105M563 410h32M565 373h28M565 319h28M565 265h28M565 211h28M565 157h28" />
          <path d="M565 373l28-54M593 373l-28-54M565 319l28-54M593 319l-28-54M565 265l28-54M593 265l-28-54M565 211l28-54M593 211l-28-52" />
          <path d="M579 105H120M579 105h132M120 105l459-22M154 105l42-29M196 76l40 29M236 74l41 31M277 72l42 33M319 70l42 35M361 68l42 37M403 66l42 39M445 64l43 41M488 62l43 43M531 60l48 45" />
          <path d="M579 105l132 18M579 83l82 22M579 83l-34 22M566 83h26M570 69h18l8 14h-34z" />
          <path d="M669 117v108M657 225h24M661 225v15h16v-15" />
          <path d="M153 105v12h34v-12" />
        </g>
      </svg>
      <div className="construction-caption" aria-hidden="true">
        <span /> LIVE SITE OVERVIEW
      </div>
      <div className="simple-indicator indicator-diesel">
        <span>Diesel filled</span>
        <strong>142 L</strong>
      </div>
      <div className="simple-indicator indicator-workforce">
        <span>Workforce</span>
        <strong>67 on site</strong>
      </div>
      <div className="simple-indicator indicator-materials">
        <span>Materials</span>
        <strong>Updated</strong>
      </div>
    </div>
  );
}
