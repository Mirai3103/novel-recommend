"use client";

import { Eye, FileText } from "lucide-react";
import { useReadingSettings } from "./page-context";
import { ChapterDetail } from "@/lib/client";
import React, { useMemo } from "react";

interface ChapterContentProps {
  chapter?: ChapterDetail;
  novelTitle?: string;
}

export function ChapterContent({ chapter, novelTitle }: ChapterContentProps) {
  const { settings, scrollProgress } = useReadingSettings();

  const getMaxWidth = () => {
    switch (settings.max_width) {
      case "narrow":
        return "600px";
      case "wide":
        return "900px";
      default:
        return "750px";
    }
  };

  const getFontFamily = () => {
    switch (settings.font_family) {
      case "sans-serif":
        return "var(--font-sans)";
      case "mono":
        return "var(--font-mono)";
      default:
        return "Georgia, 'Times New Roman', serif";
    }
  };

  const getThemeColors = () => {
    switch (settings.theme) {
      case "dark":
        return { bg: "#1e1e1e", text: "#e5e5e5", secondary: "#9ca3af" };
      case "sepia":
        return { bg: "#f4ecd8", text: "#5c4a3a", secondary: "#8b7355" };
      case "night":
        return { bg: "#000000", text: "#cccccc", secondary: "#808080" };
      default:
        return { bg: "#ffffff", text: "#1a1a1a", secondary: "#6b7280" };
    }
  };

  const themeColors = useMemo(() => getThemeColors(), [settings.theme]);

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (!chapter) return null;

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: themeColors.bg,
        color: themeColors.text,
      }}
    >
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted/20 z-50">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
          style={{
            width: `${scrollProgress}%`,
            transform: "translateZ(0)",
            willChange: "width",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <article
          className="mx-auto"
          style={{
            maxWidth: getMaxWidth(),
            fontFamily: getFontFamily(),
            fontSize: `${settings.font_size}px`,
            lineHeight: settings.line_height,
            textAlign: settings.text_align,
          }}
        >
          {/* Header */}
          <header className="mb-12 text-center">
            <div
              className="text-sm mb-2"
              style={{ color: themeColors.secondary }}
            >
              {novelTitle}
            </div>
            <h1 className="text-4xl font-bold mb-6 text-balance">
              {chapter.title ?? ""}
            </h1>

            {/* Meta */}
            <div
              className="flex items-center justify-center gap-6 text-sm flex-wrap"
              style={{ color: themeColors.secondary }}
            >
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {formatNumber((chapter.content?.length ?? 0) as number)} từ
              </span>
              {/* <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {chapter.meta?.reading_time} phút đọc
              </span> */}
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {formatNumber((chapter.meta?.views ?? 0) as number)} lượt xem
              </span>
            </div>

            <div className="mt-8 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </header>

          {/* Content */}
          <Content content={chapter.content ?? ""} themeColors={themeColors} />
        </article>
      </div>

      <style jsx global>{`
        .chapter-content h2 {
          text-align: center;
          font-size: 1.5em;
          margin: 2em 0 1.5em;
          font-weight: 600;
        }

        .chapter-content p {
          margin-bottom: 1.5em;
          word-spacing: 0.05em;
          letter-spacing: 0.01em;
        }

        .chapter-content p:first-of-type::first-letter {
          font-size: 3em;
          line-height: 1;
          float: left;
          margin: 0.1em 0.1em 0 0;
          font-weight: bold;
        }

        .chapter-content hr {
          margin: 3em auto;
          border: none;
          text-align: center;
          width: 100px;
          height: 2px;
          background: linear-gradient(
            to right,
            transparent,
            currentColor,
            transparent
          );
          opacity: 0.3;
        }

        .chapter-content em {
          font-style: italic;
          opacity: 0.9;
        }

        .chapter-content ::selection {
          background-color: rgba(168, 85, 247, 0.3);
        }
      `}</style>
    </div>
  );
}

type ThemeColors = {
  bg: string;
  text: string;
  secondary: string;
};
const Content = React.memo(
  ({
    content,
    themeColors,
  }: {
    content: string;
    themeColors: ThemeColors;
  }) => {
    console.log("render content");
    return (
      <div
        className="prose prose-lg max-w-none chapter-content"
        dangerouslySetInnerHTML={{ __html: content ?? "" }}
        style={{
          color: themeColors.text,
        }}
      />
    );
  }
);