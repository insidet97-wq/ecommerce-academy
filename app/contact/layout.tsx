import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — First Sale Lab",
  description: "Got a question, feedback, or a bug to report about First Sale Lab? Drop us a message — we read every submission and reply within 48 hours.",
  alternates: { canonical: "https://www.firstsalelab.com/contact" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
