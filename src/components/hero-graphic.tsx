import Image from "next/image";

export function HeroGraphic({ priority = false }: { priority?: boolean }) {
  return (
    <div className="hero-construction-visual">
      <Image
        src="/images/landing/constat-crane-building.png"
        alt="Tower crane above a building under construction"
        fill
        priority={priority}
        sizes="(max-width: 700px) 100vw, 54vw"
      />
      <span className="hero-photo-fade" aria-hidden="true" />
    </div>
  );
}
