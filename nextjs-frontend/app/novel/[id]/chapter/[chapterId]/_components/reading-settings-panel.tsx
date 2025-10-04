"use client"

import { X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useReadingSettings } from "./page-context"

export function ReadingSettingsPanel() {
  const { settings, updateSettings, resetSettings, isSettingsOpen, setIsSettingsOpen } = useReadingSettings()

  const fontFamilies = [
    { value: "serif" as const, label: "Serif", preview: "Georgia, Merriweather" },
    { value: "sans-serif" as const, label: "Sans-serif", preview: "Inter, Roboto" },
    { value: "mono" as const, label: "Monospace", preview: "JetBrains Mono" },
  ]

  const widths = [
    { value: "narrow" as const, label: "Hẹp", px: "600px" },
    { value: "medium" as const, label: "Vừa", px: "750px" },
    { value: "wide" as const, label: "Rộng", px: "900px" },
  ]

  const themes = [
    { value: "light" as const, label: "Sáng", bg: "bg-white", text: "text-black" },
    { value: "dark" as const, label: "Tối", bg: "bg-gray-900", text: "text-white" },
    { value: "sepia" as const, label: "Sepia", bg: "bg-[#f4ecd8]", text: "text-[#5c4a3a]" },
    { value: "night" as const, label: "Đêm", bg: "bg-black", text: "text-gray-300" },
  ]

  return (
    <>
      {/* Backdrop */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsSettingsOpen(false)} aria-hidden="true" />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-background border-l border-border z-50 transform transition-transform duration-300 overflow-y-auto ${
          isSettingsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Cài đặt đọc</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Font Family */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Font chữ</label>
            <div className="grid gap-2">
              {fontFamilies.map((font) => (
                <button
                  key={font.value}
                  onClick={() => updateSettings({ font_family: font.value })}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    settings.font_family === font.value
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-border hover:border-purple-500/50"
                  }`}
                >
                  <div className="font-medium">{font.label}</div>
                  <div className="text-xs text-muted-foreground">{font.preview}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Cỡ chữ</label>
              <span className="text-sm text-muted-foreground">{settings.font_size}px</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateSettings({ font_size: Math.max(14, settings.font_size - 2) })}
              >
                A-
              </Button>
              <Slider
                value={[settings.font_size]}
                onValueChange={([value]) => updateSettings({ font_size: value })}
                min={14}
                max={26}
                step={1}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateSettings({ font_size: Math.min(26, settings.font_size + 2) })}
              >
                A+
              </Button>
            </div>
          </div>

          {/* Line Height */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Khoảng cách dòng</label>
              <span className="text-sm text-muted-foreground">{settings.line_height.toFixed(1)}</span>
            </div>
            <Slider
              value={[settings.line_height]}
              onValueChange={([value]) => updateSettings({ line_height: value })}
              min={1.4}
              max={2.4}
              step={0.1}
            />
          </div>

          {/* Content Width */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Độ rộng nội dung</label>
            <div className="grid grid-cols-3 gap-2">
              {widths.map((width) => (
                <button
                  key={width.value}
                  onClick={() => updateSettings({ max_width: width.value })}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    settings.max_width === width.value
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-border hover:border-purple-500/50"
                  }`}
                >
                  <div className="font-medium text-sm">{width.label}</div>
                  <div className="text-xs text-muted-foreground">{width.px}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Chủ đề</label>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => updateSettings({ theme: theme.value })}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    settings.theme === theme.value
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-border hover:border-purple-500/50"
                  }`}
                >
                  <div className={`w-full h-8 rounded mb-2 ${theme.bg}`} />
                  <div className="text-sm font-medium">{theme.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Text Align */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Căn chỉnh</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateSettings({ text_align: "left" })}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  settings.text_align === "left"
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-border hover:border-purple-500/50"
                }`}
              >
                Trái
              </button>
              <button
                onClick={() => updateSettings({ text_align: "justify" })}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  settings.text_align === "justify"
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-border hover:border-purple-500/50"
                }`}
              >
                Căn đều
              </button>
            </div>
          </div>

          {/* Reset Button */}
          <Button variant="outline" className="w-full bg-transparent" onClick={resetSettings}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Đặt lại mặc định
          </Button>
        </div>
      </div>
    </>
  )
}
