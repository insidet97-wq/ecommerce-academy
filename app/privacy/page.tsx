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
          <p style={{ fontSize: 13, color: "#a1a1aa" }}>Last updated: 29 April 2026</p>
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
              <li><strong>Usage data:</strong> anonymous page-view counts via Vercel Analytics (cookieless, no cross-site tracking). With your consent, we also load Google Analytics 4 for more detailed behavioural data.</li>
              <li><strong>AI tool inputs and outputs:</strong> when you use an AI tool (Ad Copywriter, UGC Brief, Ad Auditor, Product Description Writer, Subject Line Tester, Store Autopsy), the inputs you submit and the response we return are stored against your account. This is used for daily rate-limiting and so you can later revisit your past results in your account.</li>
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
                  ["Stripe", "Payment processing, subscriptions, and billing portal"],
                  ["Resend", "Transactional emails (welcome, module completion, weekly digest, etc.)"],
                  ["Groq", "AI generation for free / Pro-tier features (Niche Picker, blog, weekly product picks, ad copy). Inputs you provide are sent to Groq for processing."],
                  ["Google AI (Gemini)", "AI generation for Scale Lab (Growth-tier) features (Store Autopsy, advanced ad tools). Used only when you trigger one of these tools. Inputs you provide are sent to Google for processing."],
                  ["Google AdSense", "Display advertising for free users (only loaded after you accept cookies)"],
                  ["Google Analytics 4", "Site analytics (only loaded after you accept cookies)"],
                  ["Vercel", "Hosting and cookieless page-view analytics"],
                ].map(([service, purpose]) => (
                  <tr key={service} style={{ borderBottom: "1px solid #f4f4f5" }}>
                    <td style={{ padding: "10px 0", color: "#09090b", fontWeight: 600, whiteSpace: "nowrap" }}>{service}</td>
                    <td style={{ padding: "10px 12px", color: "#52525b" }}>{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="5. Cookies and tracking">
            <p>The first time you visit, we ask whether to load optional tracking. You have two choices:</p>
            <ul>
              <li><strong>&ldquo;Essential only&rdquo;</strong> — only the cookies needed for the site to work load: a Supabase session cookie (to keep you logged in) and Stripe checkout cookies (only on the upgrade flow, used to prevent payment fraud).</li>
              <li><strong>&ldquo;Accept all&rdquo;</strong> — the above plus Google Analytics 4 (site analytics) and Google AdSense (ads for free users). These set additional cookies in your browser.</li>
            </ul>
            <p>Vercel page-view analytics is always loaded, since it is cookieless and does not track you across sites.</p>
            <p>You can change your choice at any time by clearing your browser&apos;s site data for firstsalelab.com — the consent banner will reappear on your next visit.</p>
            <p>Pro and Scale Lab members never see ads, regardless of cookie choice.</p>
          </Section>

          <Section title="6. Data retention">
            <p>We keep your account data for as long as your account is active. When you delete your account (from <Link href="/settings" style={{ color: "#6366f1" }}>Settings → Danger zone</Link>), your profile, module progress, AI tool history, supplier validations, referral code, and other personal data are removed immediately and any active subscription is cancelled.</p>
            <p>Two narrow exceptions:</p>
            <ul>
              <li><strong>Stripe billing records</strong> are retained by Stripe (not us) for as long as required by tax law in their jurisdiction. We hold no copy after deletion.</li>
              <li><strong>Aggregated analytics data</strong> (e.g. &ldquo;X% of users completed Module 3&rdquo;) may be retained indefinitely — this data does not identify you.</li>
            </ul>
          </Section>

          <Section title="7. Your rights">
            <p>You have the right to:</p>
            <ul>
              <li><strong>Delete your account and all personal data</strong> — instantly, from <Link href="/settings" style={{ color: "#6366f1" }}>Settings → Danger zone</Link>.</li>
              <li><strong>Access or export the personal data we hold about you</strong> — email <a href="mailto:support@firstsalelab.com" style={{ color: "#6366f1" }}>support@firstsalelab.com</a> and we&apos;ll send a JSON export within 30 days.</li>
              <li>Correct inaccurate data — change your name from <Link href="/settings" style={{ color: "#6366f1" }}>Settings</Link>, or email us for anything else.</li>
              <li>Unsubscribe from marketing emails at any time (transactional emails related to your account cannot be opted out of while your account is active).</li>
              <li>Lodge a complaint with your local data protection authority if you believe we&apos;ve mishandled your data.</li>
            </ul>
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
