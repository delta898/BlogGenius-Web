"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface RevealProperties {
  readonly children: ReactNode;
  readonly className?: string;
}

export default function Reveal({ children, className = "" }: RevealProperties) {
  const reference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("js");
    const element = reference.current;
    if (!element) {
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      element.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  const classes = ["reveal", className].filter((part) => part !== "").join(" ");

  return (
    <div ref={reference} className={classes}>
      {children}
    </div>
  );
}
