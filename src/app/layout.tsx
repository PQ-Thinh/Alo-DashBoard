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
      {/* Inline script: apply theme before React paints to prevent flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme');
                  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
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
