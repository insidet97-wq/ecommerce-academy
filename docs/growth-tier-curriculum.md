# Growth Tier — Full Curriculum (Modules 13–24)

> **Draft for owner review.** Written 2026-04-28. After approval, this content gets compiled into `lib/modules.ts` (modules 13-24) with a new `tier: "growth"` field for gating.

---

## Tier Naming — Pick One

Three options, ordered by my recommendation:

### 🥇 1. **Scale Lab** *(my pick)*
*Why*: Mirrors "First Sale Lab" naturally — same parent brand, clearly the next stage. "Scale" is the universal language ecommerce operators use post-first-sale. Easy to brand: "First Sale Lab → Scale Lab".

### 🥈 2. **The Operator Tier**
*Why*: Reframes the user identity. They're no longer a "beginner trying to start a store" — they're an *operator* running a real business. Identity-based pricing justifies the $49.

### 🥉 3. **Predictable Revenue Tier**
*Why*: Outcome-driven name. Tells them exactly what they get. Slightly less catchy.

**My vote: Scale Lab.** I'll use this throughout the curriculum below — easy find-and-replace if you pick differently.

---

## Tier Promise

> **Turn random sales into predictable revenue.**
> You've made your first sales. Now master the metrics, creative, and systems that separate hobby stores from real businesses doing $5k-$50k/month.

**Position vs Pro tier:**
- **Free** = "How to start" (Modules 1-6)
- **Pro $19/mo** = "How to launch" (Modules 7-12 + weekly product picks + monthly briefing)
- **Scale Lab $49/mo** = "How to *operate*" (Modules 13-24 + Pro features + advanced perks)

---

## How this tier is different from Pro

The Pro tier teaches **execution** — how to run your first ad, how to make your first sale.

The Scale Lab teaches **diagnosis and engineering** — why your first sales aren't repeating, how to spot real winners vs lottery wins, how to scale without destroying margin.

Every module assumes you've finished modules 1-12, run at least one ad campaign, and have at least 1-10 sales under your belt. **Zero beginner content.** No "what is Shopify". No "how to install a pixel". This tier starts where Module 12 ends.

---

# The 12 Modules — Full Content

Each module follows the same shape as the first-tier modules in `lib/modules.ts`:
- `objective` (transformation in 1 sentence)
- `concepts` (3-4 framework concepts, with body)
- `steps` (5-7 specific actions)
- `mistakes` (4-5 things to avoid)
- `checklist` (5-7 completion items)
- `resources` (3-5 tools/links)

---

## PHASE 1 · DIAGNOSE (Modules 13-15)

*"Stop guessing. Start measuring. Until you can read your own numbers, every move is a gamble."*

---

### Module 13 — Why Your First Sales Won't Repeat

**Duration:** ~30 min
**Emoji:** 🔬

**Objective:** Understand why early sales feel random — and why most "winners" at low volume are actually noise. Stop trusting the lottery; start trusting the data.

**Key concepts:**

1. **Survivorship bias kills beginners.** When you scroll TikTok and see "I made $10k in 30 days dropshipping", you're seeing the 1 winner out of 10,000 attempts. The 9,999 losers don't post videos. The first sales you make follow the same statistical reality — they're the survivors of dozens of impressions you didn't track. Treating them as proof of a winning system is exactly how stores blow money scaling something that was always going to fail.

2. **The noise problem at low volume.** Statistical reality: at fewer than ~30 conversions per variant, you cannot distinguish a real winner from random luck. A 2% conversion rate vs a 4% conversion rate looks like the second is "twice as good" — but with only 50 visits each, the confidence interval is so wide you'd need 10x more traffic to know which is actually better. (Source: any A/B testing primer; *Experimentation Works* covers this in depth.)

3. **The repeatability test.** A real winner produces sales **week 2** with similar inputs — not just week 1. If you ran a $20 ad and got 3 sales, that's the lottery. If you ran the same ad for 14 days at consistent spend and got proportional sales the whole time, that's a system. Most beginners scale based on week 1 and get crushed in week 3.

4. **Lucky money vs skill money.** Lucky money (random first sales) feels identical to skill money (repeatable system) when it lands in your account. The difference: only one of them is *predictive*. Until you can answer "if I spend $100 tomorrow, how many sales will I make?" within ±20%, you don't have a business — you have a one-time event.

**Your action steps:**

1. Pull your last 30 days of sales data from Shopify. Sort by date. Look at the gaps between sales.
2. For each sale, write down: (a) which ad/source drove it, (b) what was your ad spend that day, (c) what was your CPM/CTR/CPC. If you can't fill any column, that's your first lesson — you're not tracking.
3. Calculate: of your sales, how many came from the **same** product + creative combo? If your "winners" are scattered across 5 different products, you don't have a winner — you have a lucky portfolio.
4. Run the **repeatability test**: pick your single best ad and run it for 7 more days at the same daily budget. Document the results.
5. Write down the answer to one question: "If I spend $50 on ads tomorrow, how many sales should I expect?" If your answer is "I don't know" or "anywhere from 0 to 10", continue to Module 14.

**Common mistakes:**

- Scaling a campaign after 2-3 sales because the ROAS looks good — at that volume, ROAS is meaningless noise.
- Killing a campaign after 1 day with no sales — the sample is too small to conclude anything.
- Looking at your best sales day and assuming it's normal — outliers fool everyone.
- Switching products every week because "this one didn't work" without ever giving any product enough volume to actually validate.
- Reading TikTok success videos as data — they're lottery winners with cameras.

**Checklist (mark complete when):**

- [ ] I have a spreadsheet of every sale from the last 30 days with source attribution
- [ ] I've identified which sales came from the same product + creative combo
- [ ] I've run my best ad for at least 7 consecutive days at consistent budget
- [ ] I can explain to a friend the difference between "I had a winner" and "I had a lucky day"
- [ ] I've written down what daily spend produces what daily sales — and how confident I am in that estimate

**Resources:**

- *Experimentation Works* by Stefan Thomke — Chapters 1-3 cover statistical significance for non-statisticians
- [Statistical Significance Calculator](https://www.surveymonkey.com/mp/ab-testing-significance-calculator/)
- Sean Ellis, *Hacking Growth* — Chapter on the High-Tempo Testing framework

---

### Module 14 — The Numbers That Actually Matter

**Duration:** ~40 min
**Emoji:** 📊

**Objective:** Build a dashboard of the 8 metrics that actually drive an ecommerce business — and the thresholds that tell you whether each is healthy, marginal, or dying.

**Key concepts:**

1. **The two layers: platform metrics vs business metrics.** Platform metrics live inside Meta/TikTok ads manager: CPM, CTR, CPC, hook rate, ad ROAS. Business metrics live in your Shopify dashboard or P&L: AOV, contribution margin, blended ROAS, refund rate, LTV. Beginners optimize platform metrics. Pros optimize business metrics. The two often disagree — Meta says ROAS 2.4 (great!), but blended P&L says you lost money this month.

2. **The 8 metrics every operator tracks.**
   - **CPM** (cost per 1000 impressions) — your audience cost. Healthy: $10-20. Concerning: $30+.
   - **CTR** (click-through rate) — creative strength. Healthy: 1.5%+. Concerning: <1%.
   - **CPC** (cost per click) — derived from CPM/CTR. Healthy: <$1. Concerning: $2+.
   - **CR** (conversion rate, store) — your offer + product page. Healthy: 2.5%+. Concerning: <1.5%.
   - **CPA** (cost per acquisition) — what one customer costs. Must be < contribution margin.
   - **AOV** (average order value) — what each customer spends. Lever: bundles + upsells.
   - **Contribution margin** = AOV − COGS − shipping − transaction fees − ad cost. This is your *real* profit per order.
   - **Blended ROAS** = total revenue / total ad spend (across all channels). Always lower than platform ROAS, and always more accurate.

3. **The North Star Metric (NSM).** *(From Sean Ellis's *Hacking Growth*.)* You can't manage 8 metrics daily. You need ONE metric that summarizes everything. For most ecommerce stores, the NSM is **profitable orders per day** — the count of orders where contribution margin > 0 after ad spend. Track that one number daily. Everything else is diagnostic.

4. **Thresholds, not vanity.** Don't ask "is this CTR good?" — ask "is this CTR above the threshold I need to be profitable?" Your real CTR target is whatever produces your target CPC at your current CPM. Calculate backwards from your contribution margin.

**Your action steps:**

1. Build a simple Google Sheets dashboard. Columns: Date, Spend, Impressions, Clicks, Sessions, Add-to-Cart, Checkout, Purchases, Revenue, COGS, Shipping, Fees, Refunds, Contribution Margin.
2. Set up daily auto-population (Shopify export + Meta/TikTok export, or use Triple Whale / Polar / Lifetimely).
3. Calculate your target metrics by working backwards: pick a target contribution margin (e.g. $15/order), work back to required CPA, then required CR, then required CPC, then required CPM/CTR combo.
4. Add a "verdict" column to each ad/campaign: GREEN (above threshold), YELLOW (at threshold), RED (below threshold). Update daily.
5. Track NSM (profitable orders/day) on the top line. Set a 7-day rolling average.
6. **Stop reading platform ROAS in isolation.** Always pair it with blended ROAS from your P&L.

**Common mistakes:**

- Watching CPM obsessively but ignoring CR (your store could be the bottleneck, not your ads)
- Believing platform ROAS — Meta over-reports by 20-50% post-iOS17 due to lost attribution
- Tracking metrics without thresholds (a number is useless without knowing what's "good" for *your* margin)
- Optimizing for ROAS instead of contribution margin (a 3.0 ROAS on a $20 product with $15 COGS is unprofitable)
- Updating dashboards weekly instead of daily — slow feedback = slow learning

**Checklist:**

- [ ] I have a dashboard with all 8 core metrics, updated daily
- [ ] I've calculated my required CPA, CTR, CPC, and CR thresholds based on my contribution margin
- [ ] I have a North Star Metric posted somewhere I see every day
- [ ] I track blended ROAS from my P&L, not just platform ROAS
- [ ] Every ad has a GREEN/YELLOW/RED verdict updated each morning
- [ ] I know my contribution margin per order to the cent

**Resources:**

- [Triple Whale](https://www.triplewhale.com/) — best ecommerce attribution dashboard ($129+/mo, free trial)
- [Northbeam](https://www.northbeam.io/) — alternative for >$50k/mo stores
- [Lifetimely](https://lifetimely.io/) — Shopify P&L + LTV (free tier)
- *Hacking Growth* by Sean Ellis — Chapter 3 on choosing a North Star Metric
- [Storeya CPC benchmarks 2026](https://www.storeya.com/blog/) — current platform benchmarks

---

### Module 15 — The Profit Audit: Are You Actually Making Money?

**Duration:** ~35 min
**Emoji:** 💸

**Objective:** Run a true 30-day P&L on your store. Most "profitable" beginner stores are actually losing money once refunds, fees, and true CPA are counted. Find out which side you're on.

**Key concepts:**

1. **The 4 hidden costs that wreck beginner P&Ls.**
   - **Refunds & chargebacks** — 5-15% of revenue depending on niche. Almost no beginner deducts these.
   - **Transaction fees** — Shopify Payments + currency conversion + Stripe fees. Adds 3-4% on average.
   - **Returned inventory loss** — for non-dropship: returned units that can't be resold.
   - **Apps & tools** — Shopify subscription, app stack, email tool, ad spy tool. Easily $200-500/mo.

2. **Platform ROAS lies post-iOS17.** Apple's privacy changes mean Meta and TikTok over-attribute conversions. A reported ROAS of 3.0 in Meta is often closer to 2.0 in reality. The **only honest number** is blended ROAS: total revenue from your Shopify ÷ total ad spend across all platforms.

3. **The contribution margin formula.** Per-order: `Sell price − COGS − shipping cost − transaction fee − ad cost per order`. If this is positive, you make money on that order. If you've never written this formula on paper for your hero product, do it before you spend another dollar on ads.

4. **The 30-day truth window.** Why 30 days? Refunds typically arrive 7-30 days after purchase. A 7-day P&L makes you look profitable; the same period at day 30 is the truth. Always use a closed 30-day window for real audits.

**Your action steps:**

1. Pick a 30-day window from at least 30 days ago (so refunds have come in). Pull every line item from Shopify, all ad platforms, and your bank statements.
2. Calculate **total revenue** (gross sales − refunds − discounts).
3. Calculate **total COGS** (sum of supplier cost + shipping cost for every order delivered).
4. Calculate **total transaction fees** (Stripe + Shopify Payments + currency conversion).
5. Calculate **total ad spend** (Meta + TikTok + Google + any other source).
6. Calculate **total app/tool costs** (everything you pay monthly for the store).
7. **True profit = Revenue − COGS − Fees − Ad Spend − Tools.** Write this number down. Sit with it.
8. If profit is negative, move to next steps in this tier — focus is on profitability before scaling.

**Common mistakes:**

- Using gross sales (no refund deduction) and calling it "revenue"
- Ignoring transaction fees — they're 3-4% and they compound
- Counting Meta's reported revenue figure (over-attributed by 20-50%)
- Forgetting that one-time ad fatigue periods spike CPA and gut your margin
- Not running this audit at all because "it'll just be depressing" — the only thing more depressing is scaling unprofitably for 6 months

**Checklist:**

- [ ] I have a complete 30-day P&L on paper or spreadsheet
- [ ] I've deducted refunds, chargebacks, and transaction fees
- [ ] I've used blended ROAS, not platform ROAS
- [ ] I know my true contribution margin per order
- [ ] I know whether my last 30 days were profitable or not, in real numbers
- [ ] If unprofitable, I've identified WHICH of the 4 hidden costs hit hardest

**Resources:**

- [Lifetimely's free 30-day P&L template](https://lifetimely.io/) — built for Shopify
- [Sortly's Shopify P&L Spreadsheet](https://www.shopify.com/blog) (free)
- *Ecommerce Evolved* by Tanner Larsson — Chapter 4 on True Profit calculations
- [Triple Whale's Pixel](https://www.triplewhale.com/) — closer-to-truth attribution than Meta

---

## PHASE 2 · VALIDATE WHAT YOU HAVE (Modules 16-18)

*"Before you scale, prove. Before you prove, isolate. Most failed stores scaled noise, not signal."*

---

### Module 16 — Real Winners vs Fake Signals

**Duration:** ~35 min
**Emoji:** 🎯

**Objective:** Apply a rigorous validation method to every "winning" product or ad before you scale it. Filter out the lottery wins from the genuine repeatable systems.

**Key concepts:**

1. **The 3-day vs 7-day truth.** Day 1-3 metrics are ad-platform algorithm warm-up + lucky audience hits. Day 4-7 is when the algorithm settles. **Never make scale decisions before day 7** — you're decisioning on noise.

2. **The 100-click rule.** Any new variant (creative, audience, landing page) needs at least 100 clicks before you can claim "it doesn't convert." With 50 clicks at 2% baseline CR, you'd expect 1 sale ± 1 — meaning 0 or 2 are both consistent with the same underlying truth. 100 clicks gives you a usable signal; 300+ gives you confidence.

3. **The repeatability test.** A real winner produces:
   - Consistent sales **week-over-week** at the same daily budget (±25%)
   - Consistent CTR & hook rate across at least 2 audiences
   - At least 30 conversions before you call it "validated"
   If your "winner" only worked when you happened to launch it on a Friday at 6pm, it's not a winner.

4. **Hook rate as the early indicator.** Hook rate = % of viewers who watch past 3 seconds. This metric stabilizes earlier than CTR or CPA because it requires far fewer impressions. A 30% hook rate with low CTR = creative is good but the message after the hook is wrong. A 10% hook rate = scroll-stopping isn't working, full stop.

**Your action steps:**

1. List every "winner" you've called out in the last 60 days. For each, write down: total impressions, total clicks, total sales, total ad spend.
2. Apply the **100-click rule** retroactively. Any "winner" with <100 clicks gets demoted to "unproven."
3. For each remaining candidate, check the **7-day window**: did sales stay consistent across 7 days at consistent spend?
4. Check the **2-audience test**: did the same creative work for at least 2 distinct audiences (e.g. interest-based AND broad)? If only one audience, you may have audience-specific noise.
5. Promote winners that pass both tests. Demote everything else to "needs more data."
6. For unproven candidates: add budget, run for 7 more days, re-test.

**Common mistakes:**

- Scaling a creative after 1 viral day because "it's working"
- Killing a creative after 24h of no sales when you have <50 clicks
- Treating "platform ROAS 5.0 over 2 days" as proof — sample size is the issue
- Not checking hook rate separately from CTR — they fail for different reasons
- Believing that "the algorithm needs 3 days to learn" as an excuse to keep losers running for a week

**Checklist:**

- [ ] I've audited every claimed "winner" against the 100-click rule
- [ ] I've checked 7-day consistency, not just 2-3 day spikes
- [ ] I've tested each winner across 2 different audiences
- [ ] I track hook rate separately as an early signal
- [ ] I have a clear "validated" vs "unproven" status for every active creative
- [ ] I've demoted at least one "winner" after applying these rules (almost everyone has at least one fake signal in their history)

**Resources:**

- [Foreplay](https://www.foreplay.co/) — ad library + creative analytics ($79/mo)
- [Motion App](https://motionapp.com/) — creative analytics with hook rate breakdowns
- *Experimentation Works* — Chapter 5 on "Lurking Variables and False Positives"
- Sean Ellis on Twitter/X — practical examples of validation criteria

---

### Module 17 — Engineering the Offer (Beyond the Product)

**Duration:** ~40 min
**Emoji:** 🎁

**Objective:** Stop optimizing the product. Start engineering the *offer*. The offer (product + price + bundle + bonus + risk reversal) is what converts. Two stores selling the same product with different offers will see 3-5x different conversion rates.

**Key concepts:**

1. **Product ≠ Offer.** Your product is what you ship. Your offer is everything wrapped around it: price anchor, bundle composition, bonus items, urgency, scarcity, risk reversal (guarantee), shipping terms, payment terms. A $40 product with a 30-day money-back guarantee and free shipping at order >$50 converts dramatically better than the same product at $40 alone.

2. **Hormozi's value equation.** *(From Alex Hormozi's $100M Offers, but the framework is universal.)*
   - Value = (Dream outcome × Perceived likelihood of achievement) ÷ (Time delay × Effort & sacrifice)
   - To increase perceived value: make the dream outcome more tangible, add proof to raise perceived likelihood, reduce time-to-result, reduce required effort.
   - Most beginners only manipulate one variable (price). Pros manipulate all four.

3. **The 5 offer levers.**
   - **Bundles** — 2-pack, 3-pack, family pack. Increases AOV and perceived value.
   - **Bonuses** — free e-book, free shipping, free additional product
   - **Risk reversal** — money-back guarantee, free returns, "try it for 30 days"
   - **Urgency/Scarcity** — "ends Friday", "only 12 left", launch pricing
   - **Payment flexibility** — Klarna, Afterpay, Shop Pay Installments. Increases conversion 10-25% on $50+ products.

4. **The ladder of offers.** A great store has 3 offer tiers visible at checkout: Single ($40), Bundle of 2 ($72, save 10%), Bundle of 3 ($96, save 20% + free bonus). Without the ladder, customers default to the cheapest. With the ladder, ~40% will trade up.

**Your action steps:**

1. Write down your current offer in one paragraph. Include: product, price, shipping policy, guarantee, any bonuses.
2. Score it against Hormozi's 4 variables (1-10 each). Where are you weakest?
3. Build 3 new offer variants:
   - **Variant A**: Same product, add 30-day money-back guarantee + free shipping over $50
   - **Variant B**: Bundle of 2 at 10% discount, with free bonus
   - **Variant C**: 3-pack bundle at 20% discount, urgency timer ("ends Sunday")
4. Run a 7-day split test: Variant A vs your current offer. Track AOV and CR separately.
5. Add Klarna or Shop Pay Installments if your AOV is over $50.
6. Document which variant won and apply learnings to your next launch.

**Common mistakes:**

- Treating price as the only lever — you can lose by being too cheap (looks like junk) and lose by being too expensive without a value stack
- Adding a guarantee in tiny grey text at the bottom — make it loud, anchor the offer
- Bundles without genuine savings — customers can do math; a "20% off bundle" that's actually 8% will get spotted
- Scarcity that's obviously fake ("Only 3 left!" forever) — kills trust
- Building a complex offer with 5 bonuses no one cares about. Better: one strong bonus tied to the product's main value

**Checklist:**

- [ ] I've written my current offer in one paragraph
- [ ] I've scored it against Hormozi's value equation
- [ ] I've designed 3 offer variants
- [ ] I've launched at least one offer test
- [ ] I have payment installments enabled if my AOV > $50
- [ ] I have a clearly visible guarantee on the product page

**Resources:**

- *$100M Offers* by Alex Hormozi — applies to ecommerce despite SaaS examples
- *The 1-Page Marketing Plan* by Allan Dib — Chapter on "Crafting an Irresistible Offer"
- [Klarna for Shopify](https://www.klarna.com/business/shopify/) — installment payments
- [Recharge for Subscriptions](https://rechargepayments.com/) — when product fits subscription model
- [Bold Bundles](https://apps.shopify.com/product-bundles) — Shopify app for bundle pricing

---

### Module 18 — Increasing AOV Without Increasing Cost

**Duration:** ~30 min
**Emoji:** 💰

**Objective:** Engineer 3-5 mechanisms that increase AOV by 20-40% from the same traffic. Higher AOV with same traffic = higher contribution margin overnight, which means you can outbid competitors on ads and still profit.

**Key concepts:**

1. **The math of AOV.** If your AOV is $40 with $25 contribution margin, you can spend up to $25 to acquire a customer. If you raise AOV to $60 (with $40 contribution margin), you can now spend up to $40 — a 60% bigger ad budget per customer, which means you can win more auctions on Meta/TikTok and out-scale competitors at the same ROAS target. **Raising AOV is the highest-leverage profit move in ecommerce.**

2. **The 4 AOV mechanisms** (in order of ease):
   - **Free shipping threshold** — set 30-50% above your current AOV. Customers add an item to qualify. (Implementation: 5 minutes)
   - **Order bumps** — small add-on at checkout (insurance, gift wrap, complementary product at $7-15)
   - **Post-purchase upsells** — one-click add an item AFTER they've paid. ReConvert app converts 15-25% of buyers.
   - **Bundles & quantity discounts** — pre-built bundles on the product page (2-pack 10% off, 3-pack 20% off)

3. **Where each mechanic captures different psychology.**
   - Free shipping threshold = loss aversion (don't lose the shipping you'd otherwise pay)
   - Order bumps = effort minimization (one click, already in flow)
   - Post-purchase upsell = commitment & consistency (already proven willing to buy)
   - Bundles = anchor pricing (the 3-pack makes the 2-pack feel reasonable)
   The combo is stronger than any single one.

4. **The realistic uplift.** A store with all 4 mechanisms running well typically sees AOV climb from baseline by 25-50%. A store with none of them is leaving 25%+ profit on the table.

**Your action steps:**

1. Calculate your current AOV. Set a free shipping threshold at 1.4x AOV (e.g., AOV $40 → free shipping at $55).
2. Add **one order bump** at checkout: pick something complementary at $9-15 (Shopify: use ReConvert or Bold Upsell).
3. Add **one post-purchase upsell**: same buyer, one-click add. Pick your second-best product, discount it 10%.
4. Build **one bundle**: 2-pack at 10% off, 3-pack at 20% off. Display on product page using a quantity selector or app.
5. Test, in order: free shipping threshold (week 1), order bump (week 2), post-purchase (week 3), bundle (week 4). Track AOV change each week.
6. After 4 weeks, calculate cumulative AOV uplift and how much extra ad spend you can now afford per customer.

**Common mistakes:**

- Setting free shipping threshold too low (no extra revenue) or too high (customers abandon)
- Order bump that's irrelevant — must complement the main product
- Post-purchase upsell that re-asks for payment — should be one-click using stored payment
- Bundles with token discounts (5% off feels like nothing — minimum 10% to register as deal)
- Adding all 4 at once — you can't tell which moved the needle

**Checklist:**

- [ ] Free shipping threshold set at 1.4x AOV
- [ ] Order bump live at checkout
- [ ] Post-purchase upsell active
- [ ] At least one product with 2-pack and 3-pack bundle pricing
- [ ] AOV uplift measured over a 4-week test
- [ ] I've recalculated my max CPA based on new AOV

**Resources:**

- [ReConvert Post-Purchase Upsells](https://apps.shopify.com/reconvert-upsell-cross-sell?mref=bfgeliiu) — affiliate link, our recommended app
- [Bold Bundles](https://apps.shopify.com/product-bundles) — bundle pricing
- [Vitals](https://vitals.co/) — 40+ conversion apps in one (incl. order bumps)
- *$100M Offers* by Hormozi — Chapter on the Value Stack

---

## PHASE 3 · PERSUADE (Modules 19-21)

*"You don't have a traffic problem. You have a persuasion problem. The same 1000 visitors will give you $200 or $2000 depending entirely on what you say to them."*

---

### Module 19 — Persuasion Foundations: The 6 Principles That Sell Anything

**Duration:** ~45 min
**Emoji:** 🧠

**Objective:** Master Cialdini's 6 universal persuasion principles and audit your current ads, product page, and emails against them. Most beginner copy has 1-2 of the 6; pro copy weaves in 5-6.

**Key concepts:**

*(All from Robert Cialdini's *Influence: The Psychology of Persuasion*. These are the most thoroughly research-backed selling principles in marketing literature.)*

1. **Reciprocity.** Humans feel obligated to return favors. *Application*: Lead with value before asking for the sale. Free e-book, free trial, free chapter, free shipping, free strategy guide. Givers receive — but only if they give *first*.

2. **Commitment & Consistency.** Once we publicly commit to something, we behave consistently with it. *Application*: Quizzes ("answer 3 questions and we'll match you with the right product") build commitment before the ask. Tiny yes → bigger yes → purchase.

3. **Social proof.** When we're uncertain, we copy others. *Application*: "10,000 happy customers." Real photo reviews. UGC videos showing real people using the product. Customer count badges. Without social proof, your ad is one stranger telling another stranger what to do.

4. **Authority.** We defer to experts. *Application*: Doctor reviews, certifications ("ISO certified"), media features ("As seen in Forbes"), founder credentials, expert endorsements. Even sub-symbolic authority signals (lab coats in skincare ads, athletic packaging in fitness products) move conversion.

5. **Liking.** We buy from people we like. *Application*: Founder story video, behind-the-scenes content, personal voice in copy ("I built this because I had the same problem"), creators who feel like the customer. UGC works because it's from someone who *feels like the audience*.

6. **Scarcity.** Things become more valuable when they're limited. *Application*: Limited stock badges, countdown timers (real ones), launch pricing windows, "while supplies last", limited edition variants. *Caveat*: must be real or trust dies.

**Your action steps:**

1. Print or screenshot your current top-performing ad. Score it 0-2 on each of the 6 principles (0 = absent, 1 = weak, 2 = strong). Write the score on the printout.
2. Repeat for: your product page hero, your email welcome flow, your checkout page.
3. Identify your weakest principles. For most beginner stores, it's *reciprocity, authority, and commitment & consistency*.
4. Add ONE missing principle to your ad. Test for 7 days against the original. Track CTR change.
5. Add ONE missing principle to your product page (commonly: better social proof — real photo reviews or video UGC). Track CR change.
6. Document which principle moved your numbers most. That's your highest-ROI principle for this product.

**Common mistakes:**

- Confusing social proof with "this product is great" copy from yourself — that's not social proof, it's self-praise
- Using fake scarcity ("Only 3 left!" that never updates) — kills trust faster than no scarcity at all
- Ignoring reciprocity entirely — most stores skip it because it requires giving something away first
- Token authority signals ("Trust badge: SSL secure") that don't actually move buyers
- Using all 6 principles at maximum intensity — comes across as desperate; pick 3-4 strongest for your product

**Checklist:**

- [ ] I've scored my top ad against all 6 principles
- [ ] I've scored my product page against all 6 principles
- [ ] I've identified my weakest 2 principles
- [ ] I've added one missing principle to my ad and tested for 7 days
- [ ] I've added one missing principle to my product page and tracked CR change
- [ ] I have a written analysis of which principle moves my conversion most

**Resources:**

- *Influence: The Psychology of Persuasion* by Robert Cialdini — required reading
- *Pre-Suasion* by Cialdini — sequel; about timing & framing
- [Loox](https://loox.app) — photo & video reviews (social proof)
- [Judge.me](https://judge.me) — review imports + photo reviews (free tier)
- [Klaviyo](https://www.klaviyo.com/) — for reciprocity-based welcome flows

---

### Module 20 — The Hook Library: How to Stop the Scroll

**Duration:** ~40 min
**Emoji:** 🪝

**Objective:** Master the 6 high-performing hook frameworks used in winning ads. Build a personal library of 20+ hooks for your product. The hook (first 3 seconds of an ad) determines 70-80% of ad performance — the rest is just retention.

**Key concepts:**

1. **Why hooks matter so much.** On TikTok and Reels, viewers decide to keep watching or scroll within 1-3 seconds. Hook rate (% who watch past 3 seconds) is the single most predictive metric for ad performance. A great body with a weak hook gets 0 views. A weak body with a great hook still tests; you can iterate the body.

2. **The 6 universal hook frameworks.**
   - **Pattern interrupt** — visual/audio that's unexpected. ("I broke my mom's dishwasher trying to clean my [product]...")
   - **Problem agitation** — name the pain immediately. ("If your hair feels like straw by 2pm, this is why...")
   - **Curiosity gap** — pose a question that demands resolution. ("This is the one mistake every [niche] makes...")
   - **Transformation reveal** — show the after, then explain. ("3 weeks ago vs today. Same person. Here's what changed...")
   - **Social proof opener** — number, badge, or quote. ("400,000 women bought this in 6 months. Here's why.")
   - **Contrarian / counterintuitive** — challenge a common belief. ("Stop drinking water at the gym. Here's what to drink instead.")

3. **STEPPS — what makes content spread.** *(Jonah Berger, *Contagious*.)*
   - **S**ocial currency — does sharing make you look smart/cool/in-the-know
   - **T**riggers — does it tie to a daily occurrence (mornings, commute, etc.)
   - **E**motion — high-arousal feelings (awe, anger, surprise) drive sharing more than content quality
   - **P**ublic — is it visible (people copy what they see)
   - **P**ractical value — does it teach something
   - **S**tories — humans are wired for narrative; stories spread, lists don't
   The hooks above embed multiple STEPPS components. The best hooks always do.

4. **The 3-3 rule.** A hook must work in 3 seconds AND from 3 feet away (mute, low-quality phone screen). If it requires audio or close attention to land, it fails on TikTok/Reels where most people scroll silently.

**Your action steps:**

1. Pick your top 3 winning competitors' ads (use Foreplay or Meta Ad Library). Watch the first 3 seconds of each. Categorize: which of the 6 frameworks?
2. For your own product, write **20 hooks** — at least 3 per framework. Don't filter at this stage; quantity first.
3. Apply the **3-3 test**: mute your phone, hold it at arm's length. Which hooks still work? Cut the rest.
4. Pick your **top 5** based on the 3-3 test. Create video drafts for each (you can use existing UGC footage or simple text-on-video).
5. Run a 5-variant ad test: same body, same offer, only the hook differs. Run 7 days at $10/day each = $350 total spend.
6. Document hook rate (3-second view rate) for each variant. Pick the winner. Now you know what hook framework works for your specific product.

**Common mistakes:**

- Writing one hook and assuming it's good — you need volume; pros write 30+ before picking
- Hooks that require audio — half your audience has the sound off
- Hooks that bury the lead ("Hi guys, today I want to show you...") — death sentence
- Generic hooks ("Check out this amazing product") — must be specific to product/niche
- Testing hooks for <3 days — hook rate stabilizes fast but conversions need full 7-day window

**Checklist:**

- [ ] I've categorized 3 winning competitor ads by hook framework
- [ ] I've written 20+ hooks for my product
- [ ] I've applied the 3-3 test and shortlisted to 5
- [ ] I've created video variants for the top 5
- [ ] I've run a 7-day, 5-variant hook test
- [ ] I have data on which hook framework wins for my product

**Resources:**

- *Contagious: Why Things Catch On* by Jonah Berger — required reading
- [Foreplay](https://www.foreplay.co/) — competitor ad library + hook analysis
- [Meta Ad Library](https://www.facebook.com/ads/library) — free, official
- *4-in-1 Copywriting* book series — hook formulas across direct response history
- [TikTok Creative Center](https://ads.tiktok.com/business/creativecenter) — trending TikTok ads

---

### Module 21 — UGC at Scale: Sourcing, Briefing, Iterating

**Duration:** ~45 min
**Emoji:** 🎬

**Objective:** Build a UGC creator pipeline that produces 8-15 ad variants per month at $50-150 per video. UGC outperforms branded content 2-4x on TikTok and Meta in 2026 — but only if you brief creators for performance, not aesthetics.

**Key concepts:**

1. **Why UGC wins.** Algorithm + audience both prefer it. The algorithm rewards content that doesn't "feel like an ad" with lower CPMs. The audience trusts it because it looks like organic content. *In 2026, branded studio ads are usually outperformed by lo-fi UGC by 30-60% on click-through rate and 2-3x on hook rate.*

2. **The 3 sourcing channels.**
   - **UGC platforms** ([Billo](https://billo.app/), [Insense](https://insense.pro/), [Trend.io](https://trend.io/)) — fastest, $40-100/video, lower variance
   - **Direct outreach to micro-creators** — find creators (1k-50k followers) in your niche, DM with paid offer. Higher quality, more management.
   - **Customer-generated content** — incentivize buyers to send video reviews. Cheapest, lowest volume. Tools: [Loox](https://loox.app), [Tolstoy](https://www.gotolstoy.com/).

3. **The brief is the work.** A great UGC creator with a bad brief = generic, unwatchable content. A mediocre creator with a great brief = winners.
   The brief must specify:
   - The exact hook (first 3 seconds, written word-for-word)
   - The pain point to dramatize
   - The transformation to show
   - The CTA (what they should say at the end)
   - Format requirements (vertical, no music — you'll add it, lighting, length 15-30s)
   - 3 reference videos showing similar style
   *Don't* ask for "a fun video about the product." That's how you get 50 unusable variants.

4. **Variant production at scale.** One winning UGC concept can be re-cut into 5-10 ad variants by:
   - Different hook (same body)
   - Different opening 3 seconds
   - Different captions/text overlays
   - Different CTA
   - Different music
   This is where Pebble, Munch, or Capcut become essential — multiplying winning content into dozens of ads cheaply.

**Your action steps:**

1. Create your **first brief**: 1-page document with hook (word-for-word), pain, transformation, CTA, format specs, 3 reference links.
2. Order **3 UGC videos** from Billo or Insense ($150-300 total) using the brief.
3. Receive deliverables, watch each, score them 1-10 on hook strength.
4. Take your **best 1**, cut into **5 variants**: same body, different hooks/openers/CTAs (use Capcut, free).
5. Run a 5-variant test against your current best-performing branded creative for 7 days at consistent budget.
6. If the UGC variant wins (it usually does), build a process: order 5 new UGC videos every 2 weeks, brief specifically for the highest-performing hook framework you identified in Module 20.

**Common mistakes:**

- Vague briefs — leads to unusable content
- Picking the prettiest UGC instead of the most stopping — aesthetic ≠ performance
- Running 1 UGC variant against 1 branded variant — sample size too small
- Not iterating winners — finding a winning UGC and never re-cutting it into more variants
- Treating UGC as "make a video" instead of "test a hypothesis" — every UGC should test something

**Checklist:**

- [ ] I have a 1-page UGC brief template
- [ ] I've ordered at least 3 UGC videos from a platform
- [ ] I've taken my best UGC and cut into 5 ad variants
- [ ] I've tested UGC vs branded creative for 7 days
- [ ] I have a 2-week cadence for ordering new UGC
- [ ] I have at least 1 winning UGC concept multiplied into 10+ variants

**Resources:**

- [Billo](https://billo.app/) — UGC creator platform, $50-100/video
- [Insense](https://insense.pro/) — paid creator network, more advanced
- [Trend.io](https://trend.io/) — TikTok-focused UGC
- [Capcut](https://www.capcut.com/) — free video editor for variant cuts
- [Foreplay's UGC swipe file](https://www.foreplay.co/) — see what winning UGC looks like
- [Loox](https://loox.app) — for customer-generated UGC
- *Made to Stick* by Chip & Dan Heath — for hook/story principles applied to UGC

---

## PHASE 4 · TEST SYSTEMATICALLY (Modules 22-23)

*"Stop changing things and 'seeing what happens.' Pros run experiments — designed, isolated, and scored. Beginners run guesses."*

---

### Module 22 — How to Test Ads Properly (Not Randomly)

**Duration:** ~40 min
**Emoji:** 🧪

**Objective:** Replace random ad-tweaking with structured experimentation. Run isolated tests with sufficient sample size. Make decisions on data, not vibes.

**Key concepts:**

1. **The ICE prioritization framework.** *(From Sean Ellis's *Hacking Growth*.)* You'll always have 50 testable ideas. ICE forces you to score each:
   - **I** (Impact, 1-10): if it works, how big is the lift?
   - **C** (Confidence, 1-10): how sure am I it'll work, based on data/precedent?
   - **E** (Ease, 1-10): how fast and cheap to launch?
   ICE score = average. Run highest scores first. Without ICE, you'll always do the easy stuff (tweaking copy) instead of the high-impact stuff (offer changes, new creators, new audiences).

2. **Isolation: change ONE variable.** Most beginner "tests" change 3 things at once: new hook, new audience, new landing page. When it wins or loses, you can't tell *why*. Always isolate one variable. The slower path is the faster path to learning.

3. **Sample size requirements.** *(From *Experimentation Works* by Stefan Thomke.)* Rough rules of thumb:
   - Hook rate test: ~5,000 impressions per variant minimum
   - CTR test: ~3,000 impressions per variant minimum
   - Conversion test: 100 clicks per variant minimum, ideally 30 conversions per variant for confidence
   If you can't afford the impressions/clicks needed, the test won't yield a usable answer. Better to skip than run an underpowered test.

4. **The 4 test categories**, in order of impact:
   - **Offer tests** (price, bundles, guarantee) — biggest swings, hardest to run
   - **Audience tests** (interest sets, broad, lookalikes) — second biggest, easy to run
   - **Creative tests** (hook, body, CTA) — third, easy to run, must be isolated
   - **Landing page tests** (hero, copy, CTA button) — smallest swings unless your page is bad

**Your action steps:**

1. List **15 testable hypotheses** for your business right now. Use this format: "If I change X, then Y will improve, because Z."
2. ICE-score each (Impact, Confidence, Ease). Sort by score.
3. Pick your top 3. Pick the one with highest ICE score for this week's test.
4. Design the test:
   - Hypothesis (one sentence)
   - One variable changed (write down what's the same)
   - Sample size required (calculate using rules above)
   - Budget required to reach sample size
   - Success metric (specific: "CTR improves by 0.3 percentage points")
   - Duration (minimum 7 days)
5. Launch. Don't peek before day 7. Don't make changes mid-test.
6. After day 7, document the result. Win, lose, or no significance — write it down. Build a "learnings doc" you maintain across all tests.

**Common mistakes:**

- Calling a test after 2 days because "it's clearly winning" — you're seeing noise
- Changing 2-3 things at once — unlearnable result
- Running 5 variants on a $100/day budget — too thin per variant for valid data
- Stopping a "losing" test early without checking sample size — might have been winning by day 7
- Not documenting results — same lessons get re-learned every quarter

**Checklist:**

- [ ] I have 15 ICE-scored hypotheses written down
- [ ] I've designed a test with explicit hypothesis, single variable, and success metric
- [ ] I've calculated required sample size and budget
- [ ] I've run my first 7-day isolated test
- [ ] I have a learnings document where every test outcome is logged
- [ ] I have a weekly cadence of one new test launched per Monday

**Resources:**

- *Hacking Growth* by Sean Ellis — Chapter on ICE prioritization & high-tempo testing
- *Experimentation Works* by Stefan Thomke — required for the test design chapter
- [Optimizely's sample size calculator](https://www.optimizely.com/sample-size-calculator/)
- [Notion test-tracking template](https://www.notion.so/) — search "growth experiment template"

---

### Module 23 — Killing, Iterating, or Scaling

**Duration:** ~35 min
**Emoji:** ⚖️

**Objective:** Build a clear decision matrix for every ad: kill, iterate, or scale. Stop holding losers out of optimism and stop scaling early winners that haven't proven repeatability.

**Key concepts:**

1. **The kill/iterate/scale decision matrix.**

   | Performance vs target | Days running | Decision |
   |---|---|---|
   | Below target | < 3 days | Wait |
   | Below target | 3-7 days | Iterate (change ONE thing) |
   | Below target | 7+ days, no improvement | KILL |
   | At target | < 7 days | Wait |
   | At target | 7+ days | Iterate to push higher |
   | Above target | 3-7 days | SCALE 20% |
   | Above target | 7+ days | SCALE 50%+ |

2. **Ad fatigue: the silent killer.** Every winning ad eventually fatigues — same audience, same creative = falling CTR, rising CPC. Signals:
   - Frequency over 2.5 (Meta) — same person seeing it 2.5+ times
   - CTR dropping for 3+ consecutive days
   - CPC rising for 3+ consecutive days
   When you see these, it's not the ad's fault — it's the audience exhausted. Solution: refresh creative, not target.

3. **Iteration vs replacement.** When iterating a struggling ad, change ONE of:
   - Hook (first 3 seconds)
   - Body messaging
   - CTA / endcard
   - Music or pacing
   - Audience or placement
   Do not start from scratch unless the data clearly says "this concept is broken." Most "killed" ads should have been iterated.

4. **The 20% scaling rule.** When scaling, increase budget by 20% per day, max. Larger jumps reset the algorithm's learning phase, often crashing performance for 3-5 days. Slow + steady wins. The single biggest mistake among self-taught operators is doubling budget on a winner — winning ad becomes a losing ad overnight.

**Your action steps:**

1. List every active ad. For each, fill in: days running, current performance vs target, and what the matrix says to do.
2. Take action on every ad based on the matrix. Kill the chronic losers. Set iteration plans for the marginals.
3. For each ad you're scaling: schedule a 20%/day budget increase. Set a calendar reminder daily.
4. Set up a **fatigue alarm**: daily check on frequency (>2.5) and trailing 3-day CTR (declining). When triggered, queue a refresh creative — don't wait for performance to crash.
5. For each iteration, isolate the single variable changed. Document hypothesis ("changing the hook from X to Y will increase hook rate by 5pts").
6. Run a weekly "kill / iterate / scale" review every Monday. 30 min. Force yourself to make decisions.

**Common mistakes:**

- Holding losers because "it might come back" — opportunity cost is real, every dollar lost is a dollar not learning on a new test
- Scaling too aggressively (>20%/day) — kills the algorithm's learning phase
- Refreshing creative on a winner before fatigue signals — kills momentum
- Iterating losers infinitely instead of admitting the concept is wrong and restarting
- Not running the Monday review — without forcing the decision, you'll drift

**Checklist:**

- [ ] Every active ad has a kill/iterate/scale verdict
- [ ] Chronic losers (7+ days under target) have been killed
- [ ] Scaling ads are on a 20%/day increase schedule
- [ ] Fatigue alarms set (frequency >2.5, CTR decline)
- [ ] Each iteration is isolated to ONE variable
- [ ] Monday weekly review is on the calendar

**Resources:**

- Sean Ellis's *Hacking Growth* — Chapter on accelerating winning experiments
- [Foreplay](https://www.foreplay.co/) — track your own and competitor creative fatigue
- [Motion App](https://motionapp.com/) — automated fatigue detection
- *Experimentation Works* — Chapter on scaling experiments without losing validity

---

## PHASE 5 · SCALE PROFITABLY (Module 24)

*"Most stores destroy themselves by scaling too fast or too soon. The discipline of scaling — adding budget without losing margin — is rarer than finding a winner in the first place."*

---

### Module 24 — Scaling Without Destroying ROAS

**Duration:** ~50 min
**Emoji:** 🚀

**Objective:** Design and execute a 30-day scaling plan that grows daily ad spend 3-5x without crashing ROAS. Build the operational machine that turns a small winning ad into a real business.

**Key concepts:**

1. **Vertical vs horizontal scaling.**
   - **Vertical** = same campaign, more budget. Easier, faster, but caps out.
   - **Horizontal** = duplicate the winning campaign, target different audiences/placements/creatives. Harder, slower, but uncapped.
   The mistake is treating these as the same thing. You start vertical (push the winning campaign), then go horizontal (replicate the success across new vectors).

2. **Why 20% is the magic number for vertical scaling.** Meta and TikTok algorithms re-enter "learning phase" if budget changes more than ~20% per day. Learning phase = unstable performance for 3-5 days. Repeated learning phases = perpetual instability = collapsed ROAS. The 20%/day cap is empirically derived from thousands of operators who've broken winning ads by ignoring it.

3. **Horizontal scaling vectors:**
   - **New audiences** — broaden interest sets, lookalike audiences, broad targeting
   - **New placements** — Stories, Reels, TikTok, Pinterest, YouTube Shorts
   - **New creatives** — variant cuts of the winner (Module 21)
   - **New geos** — once a country saturates, expand to similar markets (US → CA → AU → UK)
   - **New offer angles** — same product, different positioning (gift, self-care, performance)
   Each vector can ~match your initial winner's volume; combined, they're 3-10x the original.

4. **The retention layer (LTV multiplier).** As you scale acquisition, every customer must go into a retention machine: welcome flow (3-5 emails), abandoned cart (3 emails), post-purchase (4-6 emails), winback flow. A store with no email/SMS post-purchase loses 40-60% of potential LTV. Adding the retention layer typically increases per-customer revenue by 30-80% within 90 days — without spending more on ads.

5. **Kill triggers for scale.** Before you scale, define the conditions under which you'll *un*scale:
   - Blended ROAS drops below X for 3 days → reduce budget 30%
   - CPA rises above Y for 5 days → pause new creatives
   - Refund rate spikes above Z% → pause scaling, audit fulfillment
   Without kill triggers, you'll watch ROAS slide for 2 weeks before reacting. With triggers, you cut losses in days.

**Your action steps:**

1. Build your **30-day scaling plan**:
   - Days 1-7: vertical scale, 20%/day. Target: 2x current daily spend.
   - Days 8-14: horizontal — duplicate winner with new audience. Add 1-2 new audiences.
   - Days 15-21: horizontal — new placement (TikTok if you're on Meta, or vice versa). Test with 20% of vertical budget.
   - Days 22-30: scale winners from days 8-21 vertically (still 20%/day cap).
   Document daily spend targets, daily revenue targets, and required hires/processes.
2. Define your **kill triggers** in writing: blended ROAS floor, CPA ceiling, refund rate ceiling.
3. Build the **retention layer** if you don't have one:
   - Klaviyo (or Omnisend) account
   - Welcome flow: 3 emails over 5 days
   - Abandoned cart: 3 emails (1hr, 24hr, 72hr)
   - Post-purchase: 4 emails over 21 days
   - Winback: 1 email at 30 days post-purchase, 1 at 60 days
4. Set up your **scale dashboard** (extension of Module 14): daily spend tracker, daily revenue, blended ROAS, kill-trigger status.
5. Hire or contract help if needed at >$2k/day spend: media buyer, customer support, fulfillment ops. Scaling alone past this point usually breaks the operator.
6. Review weekly. If kill triggers fire, reduce. If they don't, continue the 30-day plan.

**Common mistakes:**

- Scaling >20%/day "just to test" — you'll trigger the algorithm reset; weeks lost
- Skipping horizontal — vertical alone caps at 2-3x your original winner's volume
- Not defining kill triggers in advance — you'll second-guess in real time and lose money
- Scaling without retention — you're paying full ad cost for every dollar of LTV
- Trying to scale + manage operations + manage CS solo past $2k/day — burnout breaks the business
- Treating scaling as a one-time event — it's a continuous process; markets and creatives shift weekly

**Checklist:**

- [ ] I have a written 30-day scaling plan with daily spend targets
- [ ] Kill triggers defined and posted (blended ROAS, CPA, refund rate)
- [ ] Email retention flows live (welcome, cart, post-purchase, winback)
- [ ] Scale dashboard tracking blended ROAS daily
- [ ] At least 2 horizontal scaling vectors prepared (new audience, new placement)
- [ ] If scaling past $2k/day: contractor or VA arrangements in place

**Resources:**

- *Hacking Growth* by Sean Ellis — Chapters on scaling growth experiments
- *Ecommerce Evolved* by Tanner Larsson — The full 4-pillar scaling framework
- [Klaviyo](https://www.klaviyo.com) — email retention (free up to 250 contacts)
- [Triple Whale](https://www.triplewhale.com) — required at scale for true blended ROAS
- [Foreplay](https://www.foreplay.co/) — for continuous creative pipeline at scale
- *Crossing the Chasm* by Geoffrey Moore — for thinking about audience expansion as you scale into mainstream

---

# Implementation Plan (for next session)

Once this curriculum is approved, here's what we'll build:

### Code changes
1. **`lib/modules.ts`** — add 12 new module objects (IDs 13-24) with all the above content
2. **New `tier` field** on each module: `"free" | "pro" | "growth"`. Backfill existing 12 modules with `"free"` (1-6) and `"pro"` (7-12).
3. **Update `isProGated()` logic** in dashboard + module pages → introduce `isGrowthGated()` for IDs 13-24. Becomes: `id > 12 && !isGrowth`.
4. **`user_profiles.is_growth`** new column (boolean, default false). Like `is_pro` but for the new tier.
5. **Stripe**: new product + price for $49/mo Growth tier. New webhook event handling: `checkout.session.completed` with metadata.tier = "growth" sets `is_growth = true`.
6. **`/upgrade` page**: redesign to show 3-tier comparison (Free / Pro $19 / Growth $49) with clear feature matrix.
7. **Dashboard module list**: visual grouping by tier, with locked icons + "Unlock with Growth" CTA on modules 13-24 for non-Growth users.
8. **Module 12 → Growth pitch**: when user completes Module 12, show celebration + Growth tier pitch (mirrors the Module 6 → Pro pattern).

### Email/cron updates
- New `growthWelcomeEmailHTML()` template — mirrors Pro welcome
- Stripe webhook fires the email on Growth checkout completion

### Admin updates
- `/admin/users` page: show tier (Free/Pro/Growth) + grant/revoke Growth toggle
- Filter by tier

### SQL migration
```sql
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_growth boolean NOT NULL DEFAULT false;
```

### Documentation
- README + CLAUDE.md updates
- Update env vars list with `STRIPE_PRICE_ID_GROWTH`

---

# Summary for owner review

**12 modules across 5 phases** that take a beginner who got their first sale to an operator who can scale predictably:

| # | Phase | Module |
|---|---|---|
| 13 | Diagnose | Why Your First Sales Won't Repeat |
| 14 | Diagnose | The Numbers That Actually Matter |
| 15 | Diagnose | The Profit Audit |
| 16 | Validate | Real Winners vs Fake Signals |
| 17 | Validate | Engineering the Offer |
| 18 | Validate | Increasing AOV Without Increasing Cost |
| 19 | Persuade | Persuasion Foundations (Cialdini's 6) |
| 20 | Persuade | The Hook Library |
| 21 | Persuade | UGC at Scale |
| 22 | Test | How to Test Ads Properly |
| 23 | Test | Killing, Iterating, or Scaling |
| 24 | Scale | Scaling Without Destroying ROAS |

**Tier name: Scale Lab. Price: $49/month. Position: Free → Pro $19 → Scale Lab $49.**

Total reading time per module: 30-50 minutes. Total tier completion time: ~20-25 hours of focused work over 3-6 months (faster doesn't help — most modules require running 7-day tests before you can complete the checklist).

**Source attribution:** Cialdini (M19), Berger STEPPS (M20), Sean Ellis ICE / North Star (M14, M22), Stefan Thomke (M22), Hormozi value equation (M17), Tanner Larsson scaling pillars (M24), Hopkins testing principles (throughout), Allan Dib offer crafting (M17).

Owner — read through, mark anything you want changed:
- Module titles
- Order/sequencing
- Specific concepts to add/remove
- Tone calibration (more direct? more friendly? more technical?)
- Anything missing
- Anything that overlaps the existing Pro tier too much

Once approved, next session we implement the whole thing.
