import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Create Your Free Account",
  description: "Sign up and get your personalised ecommerce roadmap — 24 modules across 3 tiers, with Modules 1–6 free.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
