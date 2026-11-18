import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ToastProvider } from "@/components/toast-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Hospital Santa Vida — Informação que acolhe",
  description: "Portal de informações, campanhas e novidades do hospital.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full">
        <AuthProvider>
          <TooltipProvider>
            {children}
            <ToastProvider />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
