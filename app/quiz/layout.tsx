import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Build Your Free Plan",
  description: "Answer 5 quick questions and get a personalised ecommerce roadmap built around your goals, experience and budget.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
