import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your Ecommerce Academy account and continue your roadmap to your first sale.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
