import React from "react";
import { ReadingSettingsProvider } from "./_components/page-context";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ReadingSettingsProvider>{children}</ReadingSettingsProvider>;
}
