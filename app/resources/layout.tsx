import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Resource Library",
  description: "28 hand-picked tools used by real ecommerce sellers — product research, store building, ads, email marketing and more.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
