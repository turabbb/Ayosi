import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const MIN_DURATION = 300;

export const RouteProgress = () => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    // Start progress and scroll to top on route change
    setVisible(true);
    setWidth(10);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Simulate progress
    timer.current = window.setInterval(() => {
      setWidth((w) => (w < 90 ? w + Math.random() * 15 : w));
    }, 100);

    const complete = window.setTimeout(() => {
      setWidth(100);
      window.setTimeout(() => setVisible(false), 250);
    }, MIN_DURATION);

    return () => {
      if (timer.current) window.clearInterval(timer.current);
      window.clearTimeout(complete);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60]">
      <div
        className="h-0.5 bg-primary transition-[width] duration-200"
        style={{ width: `${width}%` }}
        aria-hidden
      />
    </div>
  );
};

export default RouteProgress;
