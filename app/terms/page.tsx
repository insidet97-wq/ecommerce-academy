import Link from "next/link";

export const metadata = {
  title: "Terms of Service — First Sale Lab",
  description: "The terms and conditions that govern your use of First Sale Lab.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>

      {/* Nav */}
      <nav style={{ background: "rgba(255,255,255,0.9)", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/logo.png" alt="First Sale Lab" style={{ height: 32, width: "auto" }} />
            <span style={{ fontWeight: 800, fontSize: 14, color: "#09090b", letterSpacing: "-0.3px" }}>First Sale Lab</span>
          </Link>
          <Link href="/" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>← Home</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "52px 24px 80px" }}>

        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6366f1", marginBottom: 10 }}>Legal</p>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#09090b", letterSpacing: "-0.8px", marginBottom: 10 }}>Terms of Service</h1>
          <p style={{ fontSize: 13, color: "#a1a1aa" }}>Last updated: April 2026</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>

          <Section title="1. Acceptance of terms">
            <p>By creating an account or using First Sale Lab (&ldquo;the Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
            <p>We reserve the right to update these terms at any time. Continued use of the Service after changes are posted constitutes acceptance.</p>
          </Section>

          <Section title="2. The Service">
            <p>First Sale Lab is a self-paced ecommerce education platform available at <strong>firstsalelab.com</strong>. It consists of:</p>
            <ul>
              <li><strong>Free tier:</strong> Modules 1–6, progress tracking, and learning streaks — available at no cost.</li>
              <li><strong>Pro subscription:</strong> Modules 7–12, weekly product picks, monthly ad strategy updates, and an ad-free experience — available for $19/month.</li>
            </ul>
            <p>The content provided is educational in nature. We do not guarantee specific financial outcomes. Results depend entirely on the effort and decisions of the individual.</p>
          </Section>

          <Section title="3. Accounts">
            <ul>
              <li>You must provide accurate information when creating an account.</li>
              <li>You are responsible for keeping your login credentials secure.</li>
              <li>You may not share your account with others or use another person&apos;s account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
            </ul>
          </Section>

          <Section title="4. Pro subscription and billing">
            <ul>
              <li>The Pro subscription is billed at <strong>$19/month</strong> via Stripe.</li>
              <li>Billing is recurring and automatic. Your subscription renews on the same date each month.</li>
              <li>You may cancel at any time from your billing portal. Cancellation takes effect at the end of the current billing period — you retain Pro access until then.</li>
              <li>We do not offer refunds for partial months. If you cancel mid-cycle, your access continues until the period ends.</li>
              <li>If a payment fails, Pro access is revoked until a successful payment is made.</li>
            </ul>
          </Section>

          <Section title="5. Refund policy">
            <p>All payments are <strong>non-refundable</strong>. By completing your purchase you acknowledge and agree that no refunds will be issued, including for partial months, unused periods, or renewal charges.</p>
            <p>If you have a billing issue or believe you were charged in error, contact us at <a href="mailto:support@firstsalelab.com" style={{ color: "#6366f1" }}>support@firstsalelab.com</a> and we will review your case.</p>
          </Section>

          <Section title="6. Intellectual property">
            <p>All course content — including text, structure, frameworks, and materials — is the property of First Sale Lab. You may not reproduce, distribute, or sell any part of the course content without written permission.</p>
            <p>Your account data and progress belong to you.</p>
          </Section>

          <Section title="7. AI-generated content">
            <p>Weekly product picks and monthly briefings are generated using AI (Groq). This content is provided for informational and educational purposes only. It does not constitute financial, business, or investment advice. Always conduct your own research before making business decisions.</p>
          </Section>

          <Section title="8. Acceptable use">
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorised access to any part of the Service</li>
              <li>Share, resell, or redistribute course content</li>
              <li>Use automated tools to scrape or extract content from the platform</li>
            </ul>
          </Section>

          <Section title="9. Disclaimer of warranties">
            <p>The Service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or that any specific business results will be achieved by following the course content.</p>
          </Section>

          <Section title="10. Limitation of liability">
            <p>To the maximum extent permitted by law, First Sale Lab shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 3 months prior to the claim.</p>
          </Section>

          <Section title="11. Governing law">
            <p>These terms are governed by applicable law. Any disputes shall be resolved through good-faith negotiation first. If unresolved, disputes will be submitted to binding arbitration.</p>
          </Section>

          <Section title="12. Contact">
            <p>For any questions about these terms, contact us at <a href="mailto:support@firstsalelab.com" style={{ color: "#6366f1" }}>support@firstsalelab.com</a>.</p>
          </Section>

        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #e5e7eb", display: "flex", gap: 20 }}>
          <Link href="/privacy" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>Privacy Policy →</Link>
          <Link href="/" style={{ fontSize: 13, color: "#a1a1aa", textDecoration: "none" }}>← Back to home</Link>
        </div>

      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "28px 32px" }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: "#09090b", letterSpacing: "-0.3px", marginBottom: 16 }}>{title}</h2>
      <div style={{ fontSize: 14, color: "#52525b", lineHeight: 1.75, display: "flex", flexDirection: "column", gap: 12 }}>
        {children}
      </div>
    </div>
  );
}
