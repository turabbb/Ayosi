import { useEffect, useRef, useState } from "react";

export const useInView = <T extends HTMLElement>(options?: IntersectionObserverInit) => {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => setInView(e.isIntersecting));
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1, ...options });
    obs.observe(el);
    return () => obs.unobserve(el);
  }, [options]);

  return { ref, inView } as const;
};
