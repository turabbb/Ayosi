import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect } from "react";

const slides = [
  { image: hero1, headline: "Timeless Elegance", sub: "Hand-finished pieces for every moment" },
  { image: hero2, headline: "Crafted to Dazzle", sub: "Brilliance in every detail" },
  { image: hero3, headline: "Modern Classics", sub: "Refined designs, premium materials" },
];

export const HeroSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });

  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const id = setInterval(scrollNext, 4500);
    emblaApi.on("pointerDown", () => clearInterval(id));
    return () => clearInterval(id);
  }, [emblaApi, scrollNext]);

  return (
    <section aria-label="Hero" className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((s, i) => (
            <div className="relative min-w-0 flex-[0_0_100%]" key={i}>
              <img
                src={s.image}
                alt={`${s.headline} – luxury jewellery hero image`}
                className="h-[56vh] sm:h-[64vh] md:h-[72vh] w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-10 md:bottom-16 px-6 md:px-12">
                <div className="max-w-5xl">
                  <h1 className="text-3xl md:text-5xl font-semibold tracking-tight animate-fade-in">
                    {s.headline}
                  </h1>
                  <p className="mt-2 md:mt-4 text-muted-foreground text-sm md:text-base animate-fade-in">
                    {s.sub}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
