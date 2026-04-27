import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — First Sale Lab",
  description: "How First Sale Lab collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
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
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#09090b", letterSpacing: "-0.8px", marginBottom: 10 }}>Privacy Policy</h1>
          <p style={{ fontSize: 13, color: "#a1a1aa" }}>Last updated: April 2026</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>

          <Section title="1. Who we are">
            <p>First Sale Lab (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is an ecommerce education platform operated at <strong>firstsalelab.com</strong>. We help beginners build their first Shopify dropshipping business through a structured 12-module course.</p>
            <p>If you have any questions about this policy, contact us at <a href="mailto:support@firstsalelab.com" style={{ color: "#6366f1" }}>support@firstsalelab.com</a>.</p>
          </Section>

          <Section title="2. What data we collect">
            <p>We collect only what is necessary to provide the service:</p>
            <ul>
              <li><strong>Account data:</strong> your email address, first name, and password (hashed — we never see it) when you sign up.</li>
              <li><strong>Progress data:</strong> which modules you have completed and when, your learning streak, and your quiz answers.</li>
              <li><strong>Payment data:</strong> handled entirely by Stripe. We store only your Stripe customer ID and subscription ID — never your card details.</li>
              <li><strong>Usage data:</strong> page views and basic analytics collected by Vercel Analytics (anonymous, no cross-site tracking).</li>
              <li><strong>Email engagement:</strong> whether you open or click emails we send via Resend.</li>
            </ul>
          </Section>

          <Section title="3. How we use your data">
            <ul>
              <li>To create and manage your account</li>
              <li>To track your course progress and learning streak</li>
              <li>To process and manage your Pro subscription via Stripe</li>
              <li>To send you transactional emails (welcome, module completion, Pro upgrade confirmation)</li>
              <li>To send Pro members the weekly product picks and monthly ad strategy update newsletters</li>
              <li>To improve the product based on aggregated, anonymous usage patterns</li>
            </ul>
            <p>We do not sell your data. We do not use your data for advertising targeting.</p>
          </Section>

          <Section title="4. Third-party services">
            <p>We use the following third-party services to operate First Sale Lab. Each processes data under their own privacy policy:</p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ textAlign: "left", padding: "8px 0", color: "#09090b", fontWeight: 700 }}>Service</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", color: "#09090b", fontWeight: 700 }}>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Supabase", "Database and authentication (EU/US servers)"],
                  ["Stripe", "Payment processing and subscription management"],
                  ["Resend", "Transactional and newsletter emails"],
                  ["Groq", "AI generation of weekly product picks and briefings (no personal data sent)"],
                  ["Google AdSense", "Display advertising for free users"],
                  ["Vercel", "Hosting and anonymous page analytics"],
                ].map(([service, purpose]) => (
                  <tr key={service} style={{ borderBottom: "1px solid #f4f4f5" }}>
                    <td style={{ padding: "10px 0", color: "#09090b", fontWeight: 600, whiteSpace: "nowrap" }}>{service}</td>
                    <td style={{ padding: "10px 12px", color: "#52525b" }}>{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="5. Cookies">
            <p>We use cookies for:</p>
            <ul>
              <li><strong>Authentication:</strong> Supabase stores a session token in a secure cookie to keep you logged in.</li>
              <li><strong>Advertising:</strong> Google AdSense sets cookies on free users&apos; browsers to serve relevant ads. Pro members are ad-free.</li>
            </ul>
            <p>We do not use tracking or marketing cookies beyond the above.</p>
          </Section>

          <Section title="6. Data retention">
            <p>We keep your account data for as long as your account is active. If you delete your account, your personal data is removed within 30 days. Aggregated, anonymised analytics data may be retained indefinitely.</p>
          </Section>

          <Section title="7. Your rights">
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data</li>
              <li>Unsubscribe from marketing emails at any time (transactional emails related to your account cannot be opted out of while your account is active)</li>
            </ul>
            <p>To exercise any of these rights, email <a href="mailto:support@firstsalelab.com" style={{ color: "#6366f1" }}>support@firstsalelab.com</a>.</p>
          </Section>

          <Section title="8. Children">
            <p>First Sale Lab is not directed at children under the age of 16. We do not knowingly collect data from anyone under 16. If you believe a child has created an account, contact us and we will delete it promptly.</p>
          </Section>

          <Section title="9. Changes to this policy">
            <p>We may update this policy from time to time. When we do, we will update the &ldquo;last updated&rdquo; date at the top of this page. Continued use of the service after changes constitutes acceptance of the updated policy.</p>
          </Section>

        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #e5e7eb", display: "flex", gap: 20 }}>
          <Link href="/terms" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>Terms of Service →</Link>
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
