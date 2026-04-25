import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Seller Toolkit",
  description: "Free calculators for ecommerce sellers — profit margins, product validation, break-even ROAS, and a launch checklist.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
