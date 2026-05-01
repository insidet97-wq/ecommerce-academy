import Link from "next/link";

export const metadata = {
  title: "About — First Sale Lab",
  description: "First Sale Lab is built by a small team of engineers who tried ecommerce, struggled, and built the curriculum we wish existed when we started.",
  alternates: { canonical: "https://www.firstsalelab.com/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: "#f8f8fb" }}>

      {/* Nav */}
      <nav style={{ background: "rgba(255,255,255,0.92)", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/logo.png" alt="First Sale Lab" style={{ height: 32, width: "auto" }} />
            <span style={{ fontWeight: 800, fontSize: 14, color: "#09090b", letterSpacing: "-0.3px" }}>First Sale Lab</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Link href="/blog" style={{ fontSize: 13, color: "#52525b", textDecoration: "none", fontWeight: 500 }}>Blog</Link>
            <Link href="/contact" style={{ fontSize: 13, color: "#52525b", textDecoration: "none", fontWeight: 500 }}>Contact</Link>
            <Link href="/quiz" style={{ fontSize: 13, color: "#fff", background: "#6366f1", padding: "8px 16px", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>Start free →</Link>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6366f1", marginBottom: 12 }}>About</p>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: "#09090b", letterSpacing: "-0.9px", lineHeight: 1.1, marginBottom: 16 }}>
            We built the course we wish existed when we started.
          </h1>
          <p style={{ fontSize: 16, color: "#52525b", lineHeight: 1.65 }}>
            First Sale Lab is built by a small team of engineers who tried ecommerce while holding down day jobs, struggled like every beginner does, and decided to put what we learned into something real.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

          <Section title="The problem we ran into">
            <p>
              When we first looked into ecommerce a few years ago, the information landscape was a mess. The free YouTube content was either ten-year-old tactics or thinly-disguised pitches for $2,000 mentorship programs. The &ldquo;courses&rdquo; we paid for were 80% motivation and 20% real material — and the real material was usually outdated by the time we watched it. Forums were full of people selling each other dreams.
            </p>
            <p>
              So we did what engineers do: we collected what worked, threw out what didn&apos;t, and built our own playbook from first principles. We made every mistake there is to make — picking products with thin margins, running ads without break-even math, building stores that looked great but converted at 0.4%, scaling losers because the dashboard had a green up-arrow. Eventually we figured out the patterns that actually move the needle.
            </p>
            <p>
              First Sale Lab is everything we learned, distilled into a sequence a beginner can actually follow.
            </p>
          </Section>

          <Section title="What we built">
            <p>
              A 24-module curriculum that takes a complete beginner from &ldquo;I want to start a store&rdquo; to predictable monthly revenue:
            </p>
            <ul>
              <li><strong>Modules 1–6 are free.</strong> They cover the foundation — niche selection, product validation, building your store, and your first sales funnel. No credit card needed.</li>
              <li><strong>Modules 7–12</strong> ($19/month Pro) cover traffic, paid ads, conversion optimisation, email marketing, and your first sale.</li>
              <li><strong>Modules 13–24</strong> ($49/month Scale Lab) cover the part nobody teaches: why your first sales don&apos;t repeat, the eight metrics that matter at scale, persuasion frameworks (Cialdini, Hormozi), proper ad testing, and how to grow without burning your ROAS.</li>
            </ul>
            <p>
              Plus 10 AI tools that apply the modules to your specific store — ad copywriters, page audits, an AOV optimisation tool, a &ldquo;scale or kill&rdquo; ad-decision helper, and more. Built using Groq and Google Gemini so they&apos;re fast and stay current.
            </p>
          </Section>

          <Section title="How we&apos;re different">
            <p>
              We don&apos;t sell dreams. We don&apos;t promise $10K/month in 30 days. There&apos;s no Lambo on the homepage and there never will be.
            </p>
            <p>What we do promise:</p>
            <ul>
              <li><strong>No fluff.</strong> Every module ends with a concrete checklist and one specific real-world task. If you can&apos;t complete the task, you don&apos;t move to the next module. The course can&apos;t be passively watched — it has to be done.</li>
              <li><strong>Real numbers.</strong> Specific CPM thresholds, CTR ranges, AOV targets, ROAS break-even formulas. Not &ldquo;scale your winners&rdquo; — actual frameworks for what counts as a winner in the first place (the 100-click rule, the repeatability test, the ICE framework).</li>
              <li><strong>Honest about scope.</strong> Most modules take 30–45 minutes plus a real-world task. The Scale Lab modules (13–24) often take longer because they require running 7-day ad tests before the checklist can be completed. There&apos;s no skip button.</li>
              <li><strong>No coaching upsells.</strong> First Sale Lab is a curriculum, not a coaching program. The price you see is the price you pay.</li>
            </ul>
          </Section>

          <Section title="Who FSL is for">
            <p>
              We built First Sale Lab for three kinds of people:
            </p>
            <ul>
              <li>People who haven&apos;t sold anything online yet and want a plan that doesn&apos;t involve faith. The Free tier (Modules 1–6) is enough to launch.</li>
              <li>People with one product live who can&apos;t figure out why sales aren&apos;t repeating. Pro tier (Modules 7–12) covers traffic, ads, and conversion.</li>
              <li>Operators with a working store who want to scale past the noise floor and into predictable revenue. Scale Lab (Modules 13–24) is for them.</li>
            </ul>
            <p>
              And just as importantly — we built it for beginners who are tired of being sold to, who want to learn from people who actually did the work, and who are willing to do the work themselves.
            </p>
          </Section>

          <Section title="Who FSL isn&apos;t for">
            <ul>
              <li>People looking for get-rich-quick. We&apos;re honest that ecommerce is a business and businesses take work.</li>
              <li>People who want to drop $5,000 on a mentorship and have someone hold their hand. We respect your time and money too much for that.</li>
              <li>People who want to skip the work. Every module needs a real action. There are no shortcuts in here.</li>
            </ul>
          </Section>

          <Section title="Why we stay anonymous">
            <p>
              You won&apos;t see any of our names or faces on the site. That&apos;s deliberate. We&apos;d rather the work speak for itself than turn this into a personality brand. The internet has plenty of those already.
            </p>
            <p>
              FSL stands for First Sale Lab — that&apos;s the brand, that&apos;s the product. The team behind it includes engineers, ex-store-operators, and people who&apos;ve made every mistake the course warns you about. If you reach out via the contact page, you&apos;ll hear back from a real human (usually within 48 hours).
            </p>
          </Section>

          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "28px 32px", marginTop: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#09090b", letterSpacing: "-0.3px", marginBottom: 10 }}>Try the first 6 modules free</h2>
            <p style={{ fontSize: 14, color: "#52525b", lineHeight: 1.65, marginBottom: 18 }}>
              Take the 5-minute quiz. We&apos;ll build you a personalised roadmap based on your experience, time, and budget. No credit card needed.
            </p>
            <Link href="/quiz" style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              padding: "12px 24px",
              borderRadius: 12,
              textDecoration: "none",
              letterSpacing: "-0.2px",
            }}>
              Start the quiz →
            </Link>
          </div>

        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #e5e7eb", display: "flex", gap: 20 }}>
          <Link href="/contact" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>Contact us →</Link>
          <Link href="/blog" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>Read the blog →</Link>
          <Link href="/" style={{ fontSize: 13, color: "#a1a1aa", textDecoration: "none" }}>← Back to home</Link>
        </div>

      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "32px 36px" }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#09090b", letterSpacing: "-0.4px", marginBottom: 18 }}>{title}</h2>
      <div style={{ fontSize: 15, color: "#52525b", lineHeight: 1.75, display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </div>
  );
}
