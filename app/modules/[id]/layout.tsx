import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Module",
  description: "Step-by-step ecommerce training — concepts, action steps, common mistakes and a completion checklist.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
