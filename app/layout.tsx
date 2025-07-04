import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Open Crime Reports",
  description:
    "Report crimes and anti-social behaviour in your area; view a real-time map of user reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-center"
          expand={true}
          richColors={true}
          closeButton={true}
          offset="80px"
        />
      </body>
    </html>
  );
}
