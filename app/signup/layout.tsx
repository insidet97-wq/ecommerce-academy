import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Create Your Free Account",
  description: "Sign up free and get your personalised ecommerce roadmap — 12 modules built around your goals.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
