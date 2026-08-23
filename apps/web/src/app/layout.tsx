// src/app/layout.tsx
import type { Metadata } from "next";
import { Montserrat as FontSans } from "next/font/google";
import Header from "@/components/layout/header";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "SIIMA - Sistema de Informações do IMA",
  description:
    "Sistema de gerenciamento de dados do Instituto Mamíferos Aquáticos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn("min-h-screen font-sans antialiased", fontSans.variable)}
        suppressHydrationWarning={true}
      >
        <Header />
        <main className="pt-20 md:pt-24">{children}</main>

        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
