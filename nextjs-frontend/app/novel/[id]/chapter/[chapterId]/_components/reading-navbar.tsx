"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Settings, Bookmark, Share2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { useReadingSettings } from "./page-context";

interface ReadingNavbarProps {
  novelId: string;
  novelTitle: string;
  chapterTitle: string;
  chapterOrder: number;
  volumeTitle: string;
}

export function ReadingNavbar({
  novelId,
  novelTitle,
  chapterTitle,
  chapterOrder,
  volumeTitle,
}: ReadingNavbarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef<number>(0);
  const rafRef = useRef<number | undefined>(undefined);
  const { isScrolled, isSettingsOpen, setIsSettingsOpen } = useReadingSettings();

  useEffect(() => {
    let ticking = false;

    const updateNavbarState = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollYRef.current || currentScrollY < 50) {
        // Scrolling up or at top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef.current && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      }

      lastScrollYRef.current = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        rafRef.current = requestAnimationFrame(updateNavbarState);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const { theme, setTheme } = useTheme();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{ transform: 'translateZ(0)', willChange: 'transform' }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link href={`/novel/${novelId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="text-sm text-muted-foreground truncate">
              {novelTitle}
            </div>
          </div>
        </div>

        {/* Center */}
        <div className="hidden md:block text-center flex-1">
          <div className="font-semibold truncate">{chapterTitle}</div>
          <div className="text-xs text-muted-foreground">
            Chapter {chapterOrder}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full hover:bg-primary/10 hidden md:flex"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bookmark className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
