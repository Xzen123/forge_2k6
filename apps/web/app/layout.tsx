import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Civic Pulse — Government Scheme & Policy Assistant",
  description:
    "Ask about government schemes, check your eligibility, and get cited answers in Hindi, Bengali, and English — powered by live official data.",
  keywords: "government schemes, India, eligibility, yojana, scholarship, pension",
  authors: [{ name: "Civic Pulse Team" }],
  openGraph: {
    title: "Civic Pulse — Know Your Schemes",
    description: "AI-powered eligibility assistant using live official government data.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#0a0f1e] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
