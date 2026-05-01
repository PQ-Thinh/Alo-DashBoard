import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/common/Layout";
import AuthProvider from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/common/ThemeContext";

export const metadata: Metadata = {
  title: "Alo Admin Dashboard",
  description: "Hệ thống quản trị thông minh cho ứng dụng Alo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Layout>{children}</Layout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
