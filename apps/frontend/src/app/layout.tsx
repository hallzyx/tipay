import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tipay — Accountability on Stellar",
  description:
    "Create accountability sessions with XLM on Stellar. Deposit, vote, and earn rewards when others flake.",
  openGraph: {
    title: "Tipay — Accountability on Stellar",
    description:
      "Create accountability sessions with XLM on Stellar.",
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
      <body className="min-h-screen bg-[var(--color-background)] text-[var(--color-onsurface)] font-sans antialiased">
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
