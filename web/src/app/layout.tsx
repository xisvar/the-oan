import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Shield } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OAN - Open Admissions Network",
  description: "Verifiable admissions infrastructure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
              <Shield className="h-6 w-6 text-indigo-600" />
              <span>OAN</span>
            </Link>
            <div className="flex gap-6 text-sm font-medium text-slate-600">
              <Link href="/institution" className="hover:text-indigo-600 transition-colors">Institution</Link>
              <Link href="/student" className="hover:text-indigo-600 transition-colors">Student</Link>
              <Link href="/verify" className="hover:text-indigo-600 transition-colors">Verify</Link>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-slate-50">
          {children}
        </main>
      </body>
    </html>
  );
}
