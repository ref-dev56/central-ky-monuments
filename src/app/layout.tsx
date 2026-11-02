import type { Metadata } from "next";
// Fonts are self-hosted from npm packages (no request to Google at runtime).
import "@fontsource-variable/inter";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Central Kentucky Monuments",
  description:
    "Granite memorials and headstones for families in Central Kentucky.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-ivory font-sans text-ink">
        {children}
      </body>
    </html>
  );
}
