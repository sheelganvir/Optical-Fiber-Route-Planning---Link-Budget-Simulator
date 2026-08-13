import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Optical-Fiber Route Planning & Link Budget Simulator",
  description: "Telecom decision support tool for OFC route planning, attenuation analysis, link budget calculation, and site readiness.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
