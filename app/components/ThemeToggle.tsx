"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Optimized animation using transform and opacity for better performance
  const animateThemeChange = useCallback(
    async (newTheme: string) => {
      if (!buttonRef.current || isAnimating) return;

      setIsAnimating(true);

      // Get button position (cached)
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const x = buttonRect.left + buttonRect.width / 2;
      const y = buttonRect.top + buttonRect.height / 2;

      // Create or reuse overlay element
      if (!overlayRef.current) {
        overlayRef.current = document.createElement("div");
        overlayRef.current.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9999;
        will-change: transform, opacity;
        transform: translate3d(0, 0, 0);
        opacity: 0;
        transition: none;
      `;
        document.body.appendChild(overlayRef.current);
      }

      const overlay = overlayRef.current;

      // Set initial state - smooth animati
      overlay.style.background = newTheme === "dark" ? "#0a0a0a" : "#ffffff";
      overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
      overlay.style.opacity = "1";
      overlay.style.transition = "clip-path 0.5s ease-out";

      // Use requestAnimationFrame for maximum performance
      requestAnimationFrame(() => {
        // Calculate radius efficiently - simpler formula
        const maxRadius =
          Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
          ) + 50; // Small buffer for clean edges

        overlay.style.clipPath = `circle(${maxRadius}px at ${x}px ${y}px)`;

        // Switch theme instantly for no content fade
        setTheme(newTheme);
      });

      // Smooth cleanup
      setTimeout(() => {
        if (overlay) {
          overlay.style.opacity = "0";
          overlay.style.transition = "opacity 0.15s ease-out";
        }
        setTimeout(() => {
          setIsAnimating(false);
        }, 150);
      }, 500);
    },
    [isAnimating, setTheme]
  );

  const handleThemeToggle = useCallback(
    async (event: React.MouseEvent) => {
      // Prevent multiple rapid clicks
      if (isAnimating) return;

      const newTheme = theme === "light" ? "dark" : "light";

      // Get button position for CSS custom properties (for View Transitions API)
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const x = buttonRect.left + buttonRect.width / 2;
        const y = buttonRect.top + buttonRect.height / 2;

        // Set CSS custom properties more efficiently
        document.documentElement.style.setProperty(
          "--theme-toggle-x",
          `${x}px`
        );
        document.documentElement.style.setProperty(
          "--theme-toggle-y",
          `${y}px`
        );
      }

      // Check if browser supports View Transitions API
      if (
        typeof document !== "undefined" &&
        "startViewTransition" in document
      ) {
        setIsAnimating(true);

        try {
          const transition = document.startViewTransition(() => {
            setTheme(newTheme);
          });

          await transition.finished;
        } catch (error) {
          // Fallback if View Transitions fails
          await animateThemeChange(newTheme);
        } finally {
          setIsAnimating(false);
        }
      } else {
        // Optimized fallback animation
        await animateThemeChange(newTheme);
      }
    },
    [theme, isAnimating, animateThemeChange, setTheme]
  );

  // Cleanup overlay on unmount
  useEffect(() => {
    return () => {
      if (overlayRef.current) {
        document.body.removeChild(overlayRef.current);
        overlayRef.current = null;
      }
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      ref={buttonRef}
      variant="outline"
      size="icon"
      onClick={handleThemeToggle}
      disabled={isAnimating}
      className={`fixed top-4 right-4 z-50 bg-background border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200 ease-out will-change-transform hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-background disabled:hover:text-foreground disabled:hover:shadow-none ${
        isAnimating ? "shadow-md" : ""
      }`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all duration-200 ease-out will-change-transform" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all duration-200 ease-out will-change-transform" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
