import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Your Dashboard",
  description: "Track your progress across all 24 modules and pick up exactly where you left off.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
