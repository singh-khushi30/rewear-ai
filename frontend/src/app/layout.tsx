import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REWEAR",
  description: "Multimodal wardrobe planning agent",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
