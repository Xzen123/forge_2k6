import type { Metadata } from "next";
import { Bricolage_Grotesque, Host_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { CitizenOnboardingGate } from "@/components/onboarding/CitizenOnboardingGate";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const hostGrotesk = Host_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CivicPulse AI — Autonomous Public Intelligence & Digital Governance Engine",
  description:
    "Democratizing Public Policy & Automating Citizen Rights. Turn dense official gazettes and municipal circulars into verified, plain-language audio explainers and deterministic legal services.",
  keywords: "civic pulse, digital governance, government schemes, pib, gazette, india, rights, eligibility, public policy",
  authors: [{ name: "CivicPulse Team" }],
  openGraph: {
    title: "CivicPulse AI — Autonomous Public Intelligence",
    description: "Verified public policy explainers and deterministic legal assistance grounded in live official gazettes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${hostGrotesk.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('civicpulse-theme');
                if (t === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300 min-h-screen transition-colors duration-200">
        <ThemeProvider>
          <InteractiveBackground />
          <CitizenOnboardingGate>
            {children}
          </CitizenOnboardingGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
