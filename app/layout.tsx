import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notice2Action — From notice to next action",
  description: "A friend-first AI tool that turns confusing notices into clear deadlines, eligibility checks and action plans.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
