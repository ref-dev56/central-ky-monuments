import type { Metadata } from "next";
// Fonts are self-hosted from npm packages (no request to Google at runtime).
import "@fontsource-variable/inter";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BusinessJsonLd from "@/components/BusinessJsonLd";
import { getHome, getSettings, readImageSize, telHref } from "@/lib/content";
import { PRELAUNCH_NOINDEX, PRELAUNCH_ROBOTS, SITE_URL } from "@/lib/seo";

// Site-wide defaults; each page sets its own title, description and preview.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: settings.businessName,
    applicationName: settings.businessName,
    // Covers pages without their own metadata, like the 404 page.
    robots: PRELAUNCH_NOINDEX ? PRELAUNCH_ROBOTS : undefined,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, home] = await Promise.all([getSettings(), getHome()]);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-ivory font-sans text-ink">
        {/* Lets keyboard users jump past the header */}
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-brand px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <SiteHeader
          businessName={settings.businessName}
          logo={settings.logo}
          logoMark={settings.logoMark}
          phone={settings.phone}
          phoneHref={telHref(settings.phone)}
          logoSize={settings.logo ? readImageSize(settings.logo) : undefined}
          logoMarkSize={
            settings.logoMark ? readImageSize(settings.logoMark) : undefined
          }
        />
        <div id="main" className="flex flex-1 flex-col">
          {children}
        </div>
        <SiteFooter settings={settings} />
        <BusinessJsonLd
          settings={settings}
          description={home.heroIntro}
          image={home.heroImage}
        />
      </body>
    </html>
  );
}
