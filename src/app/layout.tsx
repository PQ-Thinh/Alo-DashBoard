import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/common/Layout";

export const metadata: Metadata = {
  title: "Alo Dashboard | Admin Management",
  description: "Secure administrative dashboard for the Alo messaging application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
