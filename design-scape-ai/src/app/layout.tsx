import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Design Scape AI Studio",
  description: "Parametric kitchen and dressing-room design configurator by Design Scape."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
