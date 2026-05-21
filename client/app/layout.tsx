import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Header from "../components/Header";
import AppProviders from "../components/AppProviders";

export const metadata: Metadata = {
  title: "Internship Portal — Find & Manage Internships",
  description:
    "A modern platform for students, companies, and coordinators to manage internship opportunities, applications, and placements.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          <AppProviders>
            <Header />
            <main style={{ minHeight: "calc(100vh - 64px)" }}>{children}</main>
          </AppProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
