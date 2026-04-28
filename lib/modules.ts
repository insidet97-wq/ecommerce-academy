export type Tier = "free" | "pro" | "growth";

export type Module = {
  id: number;
  /** Tier required to access this module. Defaults to "free" if missing. */
  tier?: Tier;
  title: string;
  duration: string;
  objective: string;
  concepts: { title: string; body: string }[];
  steps: string[];
  mistakes: string[];
  checklist: string[];
  resources?: { label: string; url: string }[];
};

/** Returns the tier required to access a module. Defaults to "free". */
export function tierForModule(id: number): Tier {
  if (id <= 6)  return "free";
  if (id <= 12) return "pro";
  return "growth";
}

export const modules: Module[] = [
  // ─────────────────────────────────────────────
  // FREE MODULES (1–6)
  // ─────────────────────────────────────────────
  {
    id: 1,
    title: "The Rules of the Game",
    duration: "~20 min",
    objective:
      "Understand exactly how ecommerce works before spending a single dollar — get the mental model right and every decision after this becomes easier.",
    concepts: [
      {
        title: "Your business is marketing, not your product",
        body: "Anyone can find a product on AliExpress in 20 minutes. The people who win are the ones who get good at getting attention and converting it into sales. The product is just the vehicle — marketing is the engine.",
      },
      {
        title: "The 3X Rule is non-negotiable",
        body: "Every product you sell must cost you no more than one-third of what you sell it for. If it costs you $15 landed (product + shipping to customer), you must sell it for at least $45. This is what pays for your ads, your tools, your time, and still leaves you profit. There are no exceptions.",
      },
      {
        title: "There is no free traffic",
        body: "SEO and organic content take 6–12 months to pay off. At the start, you pay for attention — either with money (paid ads) or with time (posting daily on TikTok). Both cost something real. Plan for it.",
      },
      {
        title: "Three ways to grow — and only three",
        body: "Get more customers. Get each customer to spend more per order. Get customers to come back and buy again. Every tactic you'll learn in this course — ads, email, upsells, loyalty programs — fits one of these three buckets. When you feel overwhelmed, come back to this list.",
      },
      {
        title: "Speed of money matters",
        body: "The faster money cycles through your business, the faster you grow. A product that sells in 3 days and pays out in 7 days lets you reinvest and buy more inventory faster than a product that sits for 45 days. Cash velocity is a real competitive advantage at the start.",
      },
      {
        title: "Your competitor is your market research",
        body: "If a store is running the same ads week after week, they're profitable — otherwise they'd stop. If a product has thousands of reviews on Amazon, people want it. Study what's already working before inventing anything from scratch. You're not copying; you're validating.",
      },
      {
        title: "Dropshipping vs private label — what you should know",
        body: "Dropshipping means the supplier ships direct to your customer — you never touch inventory. Private label means you manufacture under your own brand name. Start with dropshipping to validate demand with zero inventory risk. Once you hit consistent sales (100+ orders/month), migrate the best product to private label for better margins and a real brand.",
      },
    ],
    steps: [
      "Read all 7 concepts above — don't skim. This is the mental model everything else builds on.",
      "Write down honestly: what broad topic or market do you think you want to sell in? Don't filter yourself yet.",
      "Write down your honest starting budget. Under $500, $500–1,500, or $1,500+? Different budgets mean different starting strategies.",
      "Search Google for 'best dropshipping niches 2025' — not to copy, but to see what categories are already crowded and which still have room.",
      "Ask yourself: 'Do I want to build a brand I'm proud of, or just generate cash fast?' Both are valid — but they require different products and different patience levels. Decide now.",
    ],
    mistakes: [
      "Picking a product before picking an audience — you end up with something nobody specifically wants.",
      "Assuming your idea is unique. If nobody else is selling it, that's a warning sign, not an opportunity.",
      "Planning to compete on price. You will always lose to Amazon, Temu, or a bigger operator. Compete on story, presentation, and trust instead.",
      "Expecting organic content to produce sales in week one. It won't. Budget time and money for paid traffic from the start.",
      "Treating the first $500 in ad spend as 'lost money' if you don't profit immediately. It's tuition. You're buying data and learning.",
    ],
    checklist: [
      "I understand the 3X Rule and can apply it to a product price",
      "I understand the three ways to grow a business and can name all three without looking",
      "I know the difference between dropshipping and private label, and which I'm starting with",
      "I have written down my honest starting budget",
      "I have a rough niche direction to explore in Module 2",
    ],
  },

  {
    id: 2,
    title: "Find Your Niche",
    duration: "~25 min",
    objective:
      "Choose one specific, passionate, and proven-profitable niche that you will build your entire business around — using data, not guesswork.",
    concepts: [
      {
        title: "A niche is an audience, not a product",
        body: '"Dog owners who are obsessed with their pets" is a niche. "Dog collars" is a product. Always start with the people — their passions, their spending habits, their identity. Products come later.',
      },
      {
        title: "The micro-niche drill-down method",
        body: "Go three levels deep: Broad → Medium → Specific. Fitness → Home workout equipment → Resistance bands for pregnant women. The specific niche has less competition, more passionate buyers, and easier ad targeting. Most beginners stop at level two and wonder why their ads are expensive.",
      },
      {
        title: "Passion niches beat commodity niches every time",
        body: "People spend disproportionate money on things tied to their identity — fitness, pets, parenting, hobbies, sports fandoms. A hobby fisherman will spend $300 on a lure they don't need. A pet owner will buy their dog a $60 sweater. Tap into identity, not necessity.",
      },
      {
        title: "Avatar overlap is the multiplier",
        body: "The best niches are ones where your customer spends money across multiple categories. Yoga people buy mats, blocks, leggings, supplements, books, retreats, and apps. This means once you have their attention, you can sell them many things — and your email list becomes genuinely valuable.",
      },
      {
        title: "Validate trends, not just interest",
        body: "Search your niche on Google Trends and look at a 5-year chart. You want flat (stable) or rising. Anything steeply declining is a dying market. Seasonal spikes are fine if you plan for them. A niche with a rising trend means the audience is growing — which means easier ad reach and lower CPMs over time.",
      },
      {
        title: "Check for money, not just passion",
        body: 'A niche needs paying customers. Search your niche on Google and ask: are there ads running? Are there stores selling products? Are there Amazon listings with hundreds of reviews? If yes, people are spending money here. If the search results are mostly forums and Reddit posts with no commercial intent, it\'s a hobby — not a business.',
      },
    ],
    steps: [
      "Brainstorm 10 topics you personally know, love, are curious about, or have spent money on. Write them all down without filtering.",
      "Apply the micro-niche drill-down to your top 3 ideas: take each one three levels deep and write out the specific sub-niche.",
      "Open Google Trends (trends.google.com) and search your top 3 micro-niches. Set the timeframe to '5 years' and check for stable or rising trends. Eliminate any that are clearly declining.",
      "Search each niche on Reddit (reddit.com/search). Find the active subreddits. Read the top 10 posts of the month — what are people complaining about, asking for, or raving about? This is free product research.",
      "Search each niche in Facebook Groups — look for groups with 10,000+ members that have active daily posts. This is your future ad audience.",
      "Apply the 3-question filter to your finalists: Are people passionate enough to spend money? Are there already products selling? Can you find products with 3X markup potential?",
      "Pick ONE niche and commit to it. Commit means you don't second-guess it for at least 60 days.",
    ],
    mistakes: [
      "Picking a niche that's too broad — 'health and wellness' is a market, not a niche. You can't target it, and you can't win it.",
      "Picking a niche with no proven spending. 'People who like sunsets' is not a viable market.",
      "Picking a niche you personally hate just because it seems profitable. You'll quit when it gets hard. Pick something you can talk about every day.",
      "Switching niches after two weeks because it 'feels saturated.' Every niche feels saturated until you find your specific angle. Give it real time.",
      "Skipping Google Trends and Reddit research — these two steps alone separate people who guess from people who know.",
    ],
    checklist: [
      "I brainstormed at least 10 niche ideas without filtering",
      "I drilled each top idea down to a specific micro-niche (3 levels deep)",
      "I checked Google Trends for my top 3 micro-niches and confirmed stable or rising interest",
      "I found and read active Reddit threads in my niche to understand what people talk about",
      "I confirmed there are already products selling in my niche (ads, Amazon listings, stores)",
      "I have chosen ONE specific micro-niche and I am committing to it",
    ],
    resources: [
      { label: "Google Trends", url: "https://trends.google.com" },
      { label: "Reddit niche research", url: "https://www.reddit.com/search" },
      { label: "Facebook Groups search", url: "https://www.facebook.com/groups" },
    ],
  },

  {
    id: 3,
    title: "Find Your Winning Product",
    duration: "~30 min",
    objective:
      "Identify and validate one product to sell first — using real market data, not gut feeling — before spending a single dollar on inventory.",
    concepts: [
      {
        title: "Proof of demand beats a great idea every time",
        body: "You don't need a unique product. You need a product that people are already buying, served better — with better presentation, better trust, or better targeting. Look for products with sales history, not products nobody's tried yet.",
      },
      {
        title: "The price anchoring sweet spot",
        body: "Products that sell for $30–80 convert best in ecommerce. Under $25 and your margin disappears after ad spend — you need to sell 100 units to replace what 20 higher-ticket sales would earn. Over $100 and purchase hesitation rises sharply; buyers compare shop more. Start in the $35–75 range.",
      },
      {
        title: "The 'TikTok made me buy it' signal",
        body: "Search that exact phrase on TikTok. The products appearing there are already proven impulse buyers — they have visual appeal, a clear benefit, and broad audience reach. This is one of the fastest ways to find viral-ready products in 2025–2026.",
      },
      {
        title: "Amazon review mining is a shortcut to truth",
        body: "Read 1-star reviews to learn what disappoints customers (your product brief: fix these things). Read 5-star reviews to learn what customers love (your ad copy: say exactly these things). The customers have already written your marketing for you.",
      },
      {
        title: "The private label runway",
        body: "When you look at a product, ask: 'Could I brand this as my own eventually?' You're not just looking for something to dropship — you're looking for a product you can dropship first to validate, then source under your own brand when you hit 100+ orders per month. That's when margins double and brand value starts building.",
      },
      {
        title: "One winning product beats ten average ones",
        body: "The impulse is to list 50 products and see what sells. Resist it. Operators who dominate a niche go deep on one product first — better photos, better copy, better ads, better reviews. Depth beats breadth every time at the start.",
      },
    ],
    steps: [
      "Go to AliExpress (aliexpress.com), search your niche, and sort results by 'Orders.' The products at the top of that sort are actually selling. Write down 5 candidates.",
      "Open TikTok and search '[your niche] TikTok made me buy it'. Watch the top 10 results — note which products appear repeatedly.",
      "Search your niche on TikTok Shop and look at bestsellers — these have verified purchase volume.",
      "Go to Amazon and find your niche category. Click into Best Sellers. Read 5-star reviews of the top product: copy 10 exact phrases customers use. Then read 1-star reviews: note the 3 most common complaints.",
      "Apply the 3X Rule to your 5 candidates: find the AliExpress price + estimated shipping, multiply by 3, and check if that final price is competitive and realistic.",
      "Eliminate any product already sold on Amazon for under $20 with thousands of reviews — you can't win there.",
      "Pick your one product. Order one sample before committing to bulk. You need to hold it, photograph it, and test it.",
    ],
    mistakes: [
      "Falling in love with a product because YOU think it's cool. The market decides what's cool. Follow the data.",
      "Ignoring the 3X Rule because the product 'seems unique.' Uniqueness does not pay your ad bills.",
      "Picking a product that's a commodity on Amazon at $5–8 with 50,000 reviews. You cannot compete.",
      "Skipping the sample order. You will receive a product that looks nothing like the photos and you'll have already spent $500 on ads.",
      "Choosing a product with no visual demonstration angle — if you can't make a 15-second video showing it working, TikTok ads won't perform.",
    ],
    checklist: [
      "I searched AliExpress by Orders and found at least 5 product candidates",
      "I searched TikTok for 'TikTok made me buy it' in my niche and found proof of virality",
      "I mined Amazon reviews for my top product — both 5-star (copy) and 1-star (problems to fix)",
      "I applied the 3X Rule to all candidates and eliminated those that don't pass",
      "I have ONE product selected",
      "I have ordered or scheduled a sample order",
    ],
    resources: [
      { label: "AliExpress — sort by Orders", url: "https://www.aliexpress.com" },
      { label: "TikTok Shop Bestsellers", url: "https://shop.tiktok.com" },
      { label: "AutoDS — product research tool", url: "https://platform.autods.com/register?ref=NTI2MjAyMQ==" },
    ],
  },

  {
    id: 4,
    title: "Know Your Customer",
    duration: "~25 min",
    objective:
      "Build a specific, research-backed profile of exactly who you're selling to — so every word you write, every ad you run, and every product you choose speaks directly to one real person.",
    concepts: [
      {
        title: "You are not the customer",
        body: "Your job is to understand someone else's desires, fears, and language — not your own preferences. What you find appealing is irrelevant. What matters is what they think, feel, and say. This is the hardest discipline in marketing and the most valuable.",
      },
      {
        title: "The 'one person' rule",
        body: "Write all your copy as if you're speaking to one specific person, not an audience. 'Hey Sarah' converts better than 'Hey everyone.' When you write for everyone, you connect with no one. Define the exact person: her name, her Tuesday morning, her frustrations.",
      },
      {
        title: "Pain → Dream → Fear: the decision triangle",
        body: "Every customer makes a purchase decision inside this triangle. Their current pain (what's wrong right now), their dream outcome (what life looks like after the fix), and their deepest fear (what happens if they don't solve it or if your product doesn't work). Map all three for your customer — your best ads will live in this triangle.",
      },
      {
        title: "Amazon review mining for customer voice",
        body: "Go to Amazon and find the most reviewed product in your niche. Read the 4-star and 5-star reviews and copy exact phrases customers use into a document. These are not just testimonials — they are your headline, your bullet points, and your ad hooks. Customers have already told you exactly what to say.",
      },
      {
        title: "Avatar overlap amplifies lifetime value",
        body: "The most profitable avatars spend money across multiple adjacent categories. A runner buys shoes, then socks, then nutrition gels, then a running watch. If your niche has this overlap, every customer you acquire is worth significantly more over 12 months than the first purchase suggests.",
      },
    ],
    steps: [
      "Write your customer's basic profile: estimated age range, gender split, location, approximate income level, and what they do on a typical Tuesday.",
      "Answer the Pain → Dream → Fear triangle for your customer: What is their specific pain right now? What does their dream outcome look like? What is their deepest fear about this problem not being solved?",
      "Go to Amazon and find the bestselling product in your niche. Open the reviews, filter by 4–5 stars, and copy 10 exact phrases into a new document. These are your future ad hooks and bullet points.",
      "Find one active Reddit thread in your niche (from Module 2 research). Read it like a researcher — note recurring language, recurring complaints, recurring aspirations.",
      "Write a one-paragraph story of your ideal customer. Give them a name, an age, a problem, and a reason they'd buy from you today. Make it feel like a real person.",
      "Save this avatar document somewhere you'll access it constantly — you'll reference it in every module from here.",
    ],
    mistakes: [
      "Skipping this module because it feels like homework with no immediate output. Your entire ad performance depends on how well you did this step.",
      "Writing generic answers like 'they want to save money' or 'they want to be healthier.' Every human on earth wants those things. Go deeper.",
      "Forgetting to use their actual language in your ads and product copy. If your customer says 'I hate feeling bloated,' your ad should say 'I hate feeling bloated' — not 'digestive discomfort.'",
      "Making the avatar too broad because you're afraid to exclude people. The more specific your avatar, the higher your conversion rate. Specificity is not exclusion — it's connection.",
    ],
    checklist: [
      "I completed the basic demographic profile of my customer",
      "I mapped the Pain → Dream → Fear triangle with specific, detailed answers",
      "I copied at least 10 real customer phrases from Amazon reviews into a document",
      "I read at least one active Reddit thread in my niche and noted recurring language",
      "I wrote a one-paragraph avatar story with a name and a real scenario",
      "My avatar document is saved and accessible",
    ],
    resources: [
      { label: "Amazon reviews — search your niche", url: "https://www.amazon.com" },
      { label: "Reddit — find niche communities", url: "https://www.reddit.com/search" },
      { label: "Facebook Groups — find niche communities", url: "https://www.facebook.com/groups" },
    ],
  },

  {
    id: 5,
    title: "Build Your Shopify Store",
    duration: "~45 min",
    objective:
      "Launch a clean, professional store that makes visitors trust you in under 3 seconds — with all the right settings, policies, and trust signals in place before you run a single ad.",
    concepts: [
      {
        title: "First impressions happen in 3 seconds or less",
        body: "A visitor decides subconsciously whether your store is trustworthy before they read a single word. A slow-loading page, a blurry hero image, or a suspicious-looking theme kills the sale before it starts. Invest disproportionate time in your first visual impression.",
      },
      {
        title: "Your store name and domain matter",
        body: "Keep it short, brandable, and not keyword-stuffed. 'LumaPaws.com' beats 'BestDogCollarShop.com' — one sounds like a real brand, the other sounds like a spam site. You can always expand your product range; a keyword domain traps you. Check that the .com is available before you fall in love with a name.",
      },
      {
        title: "Trust signals are not optional",
        body: "New visitors don't know you. They need visual proof that you're legitimate: a money-back guarantee badge directly below the Add to Cart button, a secure checkout badge in the footer, real product photos (not just supplier images), and a review widget showing actual customer ratings above the fold.",
      },
      {
        title: "The product page formula",
        body: "Hook image or video → Social proof number ('2,400+ happy customers') → 3 bullet point benefits (outcome-focused, not feature-focused) → 'What's in the box' section → Customer reviews → FAQ (answer the 5 most common objections) → Buy button sticky on mobile. Every element earns its place or gets removed.",
      },
      {
        title: "Mobile-first is not optional",
        body: "Over 75% of your ad traffic will land on your store from a phone. Design, test, and optimize for mobile first. Every time you make a change to your store, check it on your phone before touching your desktop view.",
      },
    ],
    steps: [
      "Start your Shopify free trial at shopify.com. Choose a store name — brandable, not keyword-stuffed, .com available.",
      "Install the free 'Dawn' theme. It's clean, fast, and proven. Do not install a paid theme at this stage.",
      "Create your logo using Canva (canva.com — free). Keep it simple: wordmark in one color. Upload it. Set your brand colors (max two).",
      "Add your hero product: upload at least 4 high-quality photos (or order from the supplier's media kit), write a benefit-focused description using the customer language you captured in Module 4, set a price that passes the 3X Rule.",
      "Add these trust signals exactly: money-back badge below Add to Cart, padlock security badge in footer, free shipping threshold if applicable.",
      "Install DSers (free) from the Shopify App Store and connect it to AliExpress — this is how your dropship orders get fulfilled automatically.",
      "Install Loox or Judge.me (both free tiers available) to display product reviews. Import any available reviews from AliExpress or add your sample order review.",
      "In Shopify Settings → Legal, use the built-in generator to create your Refund Policy, Privacy Policy, and Shipping Policy. Publish all three — missing policies kill trust and can get your ad account flagged.",
      "Place a test order using Shopify's Bogus Gateway (Settings → Payments → Test mode). Go through the full checkout yourself on your phone. Time it — it should take under 2 minutes.",
    ],
    mistakes: [
      "A cluttered homepage with 20 products. You are not Amazon. One product, one focus.",
      "Using only AliExpress supplier photos — they look exactly like AliExpress supplier photos. Order your sample and photograph it yourself, or use a tool like Glorify.",
      "Missing policies — this is the #1 reason Facebook rejects ad accounts for new stores. Do not skip this.",
      "Choosing a complex paid theme that you spend 3 weeks customizing instead of launching.",
      "Not doing a mobile test order. The checkout experience on mobile has specific friction points that you won't discover until you try it yourself.",
    ],
    checklist: [
      "Shopify store is live with a brandable name and domain",
      "Dawn theme installed with brand colors and logo",
      "Hero product added with 4+ quality photos and a benefit-focused description",
      "DSers connected to AliExpress for automated fulfillment",
      "Review app installed (Loox or Judge.me) with at least some reviews showing",
      "All three policies published (Refund, Privacy, Shipping)",
      "Test order completed on mobile in under 2 minutes",
    ],
    resources: [
      { label: "Start Shopify free trial", url: "https://shopify.pxf.io/3k9Wjr" },
      { label: "Canva — free logo and graphics", url: "https://www.canva.com" },
      { label: "DSers — dropshipping fulfillment", url: "https://www.dsers.com" },
      { label: "Judge.me — product reviews app", url: "https://judge.me" },
      { label: "Loox — photo reviews app", url: "https://loox.io/app/FSL30" },
    ],
  },

  {
    id: 6,
    title: "Build Your First Sales Funnel",
    duration: "~35 min",
    objective:
      "Create a focused, single-product landing page and checkout sequence that converts 3–5× better than a standard product page — by removing friction and guiding one decision at a time.",
    concepts: [
      {
        title: "A funnel is a focused path, not a store",
        body: "No navigation menu. No 'related products' sidebar. No footer links. One product, one decision: buy or leave. Every distraction you remove increases conversion. This is not a design preference — it's a proven conversion principle. Dedicated landing pages convert 3–5× better than standard product pages.",
      },
      {
        title: "The headline formula that works",
        body: "Use this structure: [Number or Adjective] [Product] That [Specific Benefit] Without [Common Fear]. Example: 'The Compact Resistance Band Set That Builds Real Strength Without Leaving Your Living Room.' This formula addresses what they want and the specific objection standing in their way — in one sentence.",
      },
      {
        title: "Above the fold is everything",
        body: "Everything the buyer needs to make a decision should be visible without scrolling, on a phone. That means: product name, hero image, social proof number, primary benefit, price, and Add to Cart button. If they have to scroll to find the price, you are losing sales.",
      },
      {
        title: "The order bump adds 20–25% revenue for free",
        body: "A checkbox offer at checkout — 'Add a [complementary item] for just $9' — converts at 20–30% with zero extra traffic. It takes 15 minutes to set up and it never stops working. This is the highest ROI thing you will do in the first month.",
      },
      {
        title: "The thank-you page is your most underused real estate",
        body: "The customer who just bought is the most willing buyer you will ever have. They have their wallet open and their trust established. A one-click upsell on the thank-you page — 'Add this for $19 with one click, no payment details needed' — converts at 5–15%. Miss this and you're leaving significant revenue on the table.",
      },
    ],
    steps: [
      "Create a new page in Shopify (or use Zipify Pages for more control). This is your funnel landing page — not your regular product page.",
      "Write your headline using the formula: [Adjective/Number] [Product] That [Specific Benefit] Without [Common Fear]. Write 3 versions and pick the most specific one.",
      "Upload your hero image or video (15–30 second demo video outperforms static images by 2–3×). If you don't have video yet, a high-quality lifestyle photo works for now.",
      "Add your social proof line: 'Trusted by 1,200+ customers' or 'Over 800 five-star reviews.' If you don't have this yet, add a review widget showing your first reviews.",
      "Write 3 bullet point benefits — each one is an outcome, not a feature. 'Get visible results in 2 weeks' beats '200mg of active ingredient.'",
      "Remove ALL navigation links from this page (in Shopify page settings, hide header and footer, or use a landing page builder that does this by default).",
      "Install ReConvert (Shopify App Store) and set up one order bump: a complementary product priced at $7–15 shown as a checkbox at checkout.",
      "Set up one post-purchase upsell in ReConvert: a related product at 30–50% of your main product price, shown immediately after the thank-you page. One-click add — no payment re-entry.",
      "Test the complete flow yourself on your phone: land on the page, add to cart, add the bump, check out, see the upsell. Fix anything that feels slow or confusing.",
    ],
    mistakes: [
      "Keeping the navigation menu on the funnel page. A visitor who clicks away to your 'About' page is a lost sale.",
      "Writing features instead of benefits. 'Made from premium silicone' is a feature. 'Won't slip even when your hands are sweaty' is a benefit.",
      "Skipping the order bump because it feels aggressive. It isn't. It's convenience — you're offering something relevant at the moment of peak buying intent.",
      "Making the upsell more expensive than the main product. Keep it at 30–50% of the main product price.",
      "Not testing the funnel on a real phone before running ads. Mobile checkout friction you can't see on desktop will silently kill your conversion rate.",
    ],
    checklist: [
      "Dedicated funnel landing page is live (separate from the regular product page)",
      "Headline uses the benefit formula with a specific outcome and a fear removed",
      "All navigation links removed from the funnel page",
      "Hero image or demo video uploaded",
      "Order bump set up at checkout ($7–15 complementary product)",
      "Post-purchase upsell set up on thank-you page",
      "Full funnel flow tested personally on mobile",
    ],
    resources: [
      { label: "Zipify Pages — funnel builder for Shopify", url: "https://zipify.com/apps/pages" },
      { label: "ReConvert — upsells and order bumps", url: "https://apps.shopify.com/reconvert-upsell-cross-sell?mref=bfgeliiu" },
      { label: "Canva — graphics and banners", url: "https://www.canva.com" },
    ],
  },

  // ─────────────────────────────────────────────
  // PRO MODULES (7–12)
  // ─────────────────────────────────────────────
  {
    id: 7,
    title: "Drive Traffic: TikTok Organic",
    duration: "~30 min",
    objective:
      "Build a systematic TikTok content engine that drives real traffic for free — and generates validated creative insights you'll use in paid ads later.",
    concepts: [
      {
        title: "TikTok organic is the best free traffic channel available right now",
        body: "A single video from a brand-new account can reach 500,000 people with zero ad spend. No other free platform gives beginners this reach in 2025–2026. The algorithm distributes content based on engagement signals, not follower count — which means day-one accounts can go viral.",
      },
      {
        title: "The 3-format rotation system",
        body: "Post in three different formats each week to discover your winning content type. Format 1: Educational ('Did you know [surprising niche fact]'). Format 2: Story or transformation ('I tried this for 30 days — here's what happened'). Format 3: Pure entertainment with product placement. Track which format gets the most link clicks, not just views — clicks are buyers, views are spectators.",
      },
      {
        title: "Hook formulas that stop the scroll",
        body: "The first 2 seconds are everything. Proven hooks: 'POV: You just discovered the thing everyone in [niche] is obsessed with.' 'I bought this so you don't have to.' 'The [product] that got me [specific result] in [timeframe].' 'Nobody talks about this but [niche truth].' Write your hook first — then build the video around it.",
      },
      {
        title: "The 70/20/10 content rule",
        body: "70% of your content should be niche content that's not about your product — tips, education, entertainment that serves your audience. 20% should be product demonstrations and comparisons. 10% should be direct sales content with a clear call to action. Most beginners invert this and post 90% sales content — then wonder why nobody follows them.",
      },
      {
        title: "The comment reply growth hack",
        body: "When a comment asks a question or makes a strong statement, reply to it with a new video instead of a text reply. TikTok distributes these reply videos to everyone who saw the original post — plus new audiences. This compounds your reach from a single successful video and costs nothing extra.",
      },
      {
        title: "Duet and Stitch to borrow existing audiences",
        body: "Find videos in your niche with 50,000–500,000 views. Duet or Stitch them with your own reaction, addition, or counter-point. The algorithm shows your content to everyone who engaged with the original. This is how new accounts get in front of large relevant audiences before they've built their own following.",
      },
    ],
    steps: [
      "Create a TikTok Business account. Set your bio to one sentence: what you sell, and who it's for. Add your Shopify link.",
      "Search your niche on TikTok and study the top 10 videos from the last 30 days. For each: write down the exact first sentence (the hook), the format type, the view count, and whether it links to a product.",
      "Film your first 3 videos — one of each format type from the 3-format rotation. Use CapCut (free) to edit. Keep them under 30 seconds. Do not overthink production quality.",
      "Post one video per day for 14 days minimum. Schedule 30 minutes each morning to film and post. Consistency matters more than quality at this stage.",
      "After each video, check TikTok Analytics at 48 hours: views, profile visits, and link clicks. Create a simple spreadsheet: video topic, format type, hook used, views, link clicks.",
      "In week 2, find the most viewed video in your niche and Stitch it with your take. Tag the original and add your product context.",
      "After 14 days, identify your winning format type (highest link clicks per view) and double down — make 70% of your content in that format going forward.",
      "Track which video drives the most link clicks via TikTok Analytics → Traffic Source. That video's hook becomes your first paid ad creative.",
    ],
    mistakes: [
      "Making videos that look like ads. TikTok users scroll past anything that looks like an ad in under 0.5 seconds. Native-feeling content performs 3–5× better than polished commercial videos.",
      "Giving up after 10 videos. Most accounts see a breakthrough video between post 15 and post 40. The algorithm needs data before it knows who to show your content to.",
      "Not adding a clear call to action at the end: 'Link in bio to get yours' or 'Comment [keyword] and I'll send you the link.' Always tell the viewer what to do next.",
      "Posting without studying what already works. Spend 30 minutes researching before your first post — not doing so is like writing an exam you haven't studied for.",
      "Optimizing for views instead of link clicks. A video with 50,000 views and 20 link clicks is worse than a video with 5,000 views and 200 link clicks. You want buyers, not spectators.",
    ],
    checklist: [
      "TikTok Business account created with bio and store link",
      "10 competitor videos studied — hooks, formats, and view counts recorded",
      "First 3 videos filmed and posted (one per format type)",
      "Daily posting schedule maintained for at least 14 days",
      "Analytics spreadsheet created and updated after each video",
      "One Stitch or Duet with a high-performing video completed",
      "Winning format identified and documented for paid ad creative use",
    ],
    resources: [
      { label: "TikTok Business Center", url: "https://business.tiktok.com" },
      { label: "CapCut — free video editing", url: "https://www.capcut.com" },
    ],
  },

  {
    id: 8,
    title: "Run Your First Paid Ad",
    duration: "~40 min",
    objective:
      "Launch your first paid advertising campaign with a structured testing framework — and learn exactly what metrics tell you to kill, keep, or scale.",
    concepts: [
      {
        title: "Your first ad budget is tuition, not a gamble",
        body: "The goal of your first $100–200 in ad spend is not profit. It is data. You are buying information about which creative works, which audience buys, and what your conversion metrics look like. Operators who treat early ad spend as investment, not expense, iterate faster and reach profitability sooner.",
      },
      {
        title: "The creative testing framework",
        body: "Always test 3 different hooks on the same product simultaneously. Same audience, same budget per ad, same product page — only the first 3 seconds of the video changes. Let the algorithm run for 3 days without touching anything, then kill the 2 losers and scale the winner. This is the fastest way to find a profitable creative.",
      },
      {
        title: "The metrics that actually matter — and what they mean",
        body: "CPM under $15: your audience targeting is healthy and you're not in a bidding war. CTR above 1.5%: your creative is stopping the scroll. CPC under $1.50: people who see your ad are interested. ROAS above 2.0: you're making more than you're spending. If any metric is broken, you know exactly where the problem is — targeting, creative, or page.",
      },
      {
        title: "The kill-or-scale rule",
        body: "If an ad spends $30 with zero add-to-carts, kill it — the creative or the targeting is not working. If an ad hits ROAS above 2.0 after $50 in spend, increase the budget by 20% every 3 days. Never double a budget overnight — it resets the algorithm's learning phase and can tank a winning campaign.",
      },
      {
        title: "TikTok Spark Ads: the most underrated beginner tactic",
        body: "Spark Ads let you promote your existing organic TikTok videos as paid ads. Because the video already has real engagement (comments, shares, likes), it converts at a higher rate than a cold ad creative. If one of your organic videos is driving link clicks, boosting it as a Spark Ad for $20–30/day is often the fastest path to a first paid sale.",
      },
      {
        title: "The winner duplication method",
        body: "When an ad is performing well, never edit the live ad set — editing resets the learning phase. Instead, duplicate the ad set, set the same or slightly higher budget, and let the new version build its own data. The original keeps running. This is how you scale without breaking what's working.",
      },
    ],
    steps: [
      "Choose ONE platform to start: Meta Ads (better targeting data, slightly higher CPMs) or TikTok Ads (lower competition, better for visual products). Do not run both simultaneously in week one.",
      "Install the tracking pixel: Meta Pixel or TikTok Pixel. In Shopify, go to Settings → Customer events. Verify the pixel is firing by using Meta's Pixel Helper Chrome extension or TikTok's Pixel Helper. Confirm 'ViewContent' and 'AddToCart' events fire correctly.",
      "Create your campaign: Objective = Sales. Ad Set: use Advantage+ audience on Meta (let Meta find buyers) or broad targeting on TikTok (18–45, no interest layering at first). Set daily budget: $30–50/day.",
      "Create 3 video ads for the same product — each with a different hook for the first 3 seconds. Use your best-performing organic TikTok videos or film 3 variations. Keep each under 30 seconds.",
      "Launch and do not touch anything for 72 hours. Resist the urge. The algorithm needs data before it can optimize.",
      "After 72 hours, check metrics. Record: CPM, CTR, CPC, add-to-cart rate, purchase rate, ROAS. Apply the kill-or-scale rule.",
      "If TikTok organic had a strong video (1,000+ views, good link clicks): set it up as a Spark Ad. Go to TikTok Ads Manager → Spark Ads → authorize the post.",
      "After 7 days, duplicate the winning ad set and increase budget by 20%. Let both run for 3 more days before drawing conclusions.",
    ],
    mistakes: [
      "Changing the campaign before it has spent at least $30–40. You are making decisions with no statistical significance — it's guesswork.",
      "Running ads to your Shopify homepage or a standard product page. Every dollar of ad spend should go to your funnel landing page from Module 6.",
      "Setting budget under $20/day. Below this threshold, Meta and TikTok's algorithms don't have enough daily events to optimize. You get worse results, not cheaper ones.",
      "Using only static image ads for a product that needs demonstration. Video outperforms image by 2–4× on both Meta and TikTok for most physical products.",
      "Running 5 different ad sets simultaneously on a $30/day budget. Each ad set gets $6/day — not enough to learn anything. One or two ad sets at full budget produces real data.",
    ],
    checklist: [
      "Ad platform chosen (Meta OR TikTok — not both)",
      "Pixel installed and verified — ViewContent and AddToCart events confirmed firing",
      "3 video ad creatives prepared with different hooks",
      "Campaign launched: Sales objective, $30–50/day budget",
      "72-hour no-touch rule observed",
      "Key metrics recorded after 72 hours (CPM, CTR, CPC, ROAS)",
      "Kill-or-scale decision made based on data, not gut feeling",
    ],
    resources: [
      { label: "Meta Business Manager", url: "https://business.facebook.com" },
      { label: "TikTok Ads Manager", url: "https://ads.tiktok.com" },
      { label: "AdSpy — competitor ad research", url: "https://www.adspy.com" },
    ],
  },

  {
    id: 9,
    title: "Conversion Optimisation",
    duration: "~30 min",
    objective:
      "Extract more sales from the traffic you're already paying for — by finding and fixing the exact points where visitors drop off.",
    concepts: [
      {
        title: "The 7-second trust decision",
        body: "A first-time visitor to your store decides in 7 seconds whether you're trustworthy. They're not reading your copy yet — they're processing visual cues: Does this look professional? Does it load fast? Do I see social proof? If the answer to any of these is no, they're gone. Run through your store in 7 seconds with fresh eyes and ask: would a stranger trust this?",
      },
      {
        title: "The 1,000-visitor funnel audit",
        body: "After 1,000 visitors, your funnel data becomes meaningful. Target benchmarks: 5–15% add-to-cart rate (if below 5%, your product page has a problem), 60–80% checkout completion rate among those who added to cart (if below 60%, there's trust or friction at checkout), and an overall 1–3% purchase conversion rate. Each metric points to a specific fix.",
      },
      {
        title: "Heatmaps reveal what analytics hide",
        body: "Google Analytics tells you people left your page. Microsoft Clarity (free) shows you exactly where they clicked, how far they scrolled, and where they rage-clicked. Install it on your Shopify store and watch 10 session recordings. You will immediately see friction points that no amount of reading reports would reveal.",
      },
      {
        title: "The cart abandonment sequence timing",
        body: "70% of people who add to cart never complete checkout. A 3-email sequence brings back 5–15% of them at zero extra ad spend. Email 1 (1 hour after abandonment): simple reminder, no discount — just 'You left something behind.' Email 2 (24 hours): social proof, address the most common objection. Email 3 (72 hours): 10% off with urgency ('This offer expires in 24 hours'). Set this up once; it runs forever.",
      },
      {
        title: "A/B test one variable at a time — always",
        body: "Test your headline vs. an alternative headline. When you change the headline and the button color and the hero image at the same time, you have no idea what caused the result. Change one thing, run it for at least 500 visitors (or 7 days minimum), record the winner, then move to the next test. This is how CRO compounds.",
      },
    ],
    steps: [
      "Install Microsoft Clarity on your Shopify store (free — microsoft.com/clarity). It takes 5 minutes. Wait 48 hours, then watch your first 10 session recordings.",
      "Run your store URL through Google PageSpeed Insights (pagespeed.web.dev). Target a mobile score above 70. If your score is below 60, the #1 fix is compressing your images — use TinyPNG or Shopify's built-in image compression.",
      "Check your product page on a real phone. Count the number of scrolls before you reach the Add to Cart button. If it's more than one scroll, move your CTA higher.",
      "Set up your cart abandonment email sequence in Klaviyo: 3 emails at 1 hour, 24 hours, and 72 hours. Use the templates in Klaviyo's flow library as a starting point, then customize with your customer voice.",
      "Review your 1,000-visitor funnel metrics in Shopify Analytics. Identify which stage has the biggest drop-off: landing page → product page → add-to-cart → checkout → purchase. That is your only CRO priority for the next 2 weeks.",
      "Run your first A/B test on your headline. Write a second version using your Amazon review research from Module 4. Install Shopify's built-in A/B testing or use a free app like Neat A/B Testing.",
    ],
    mistakes: [
      "Adding trust badges, fake countdowns, fake stock numbers, and pop-ups all at once and calling it 'optimization.' Adding friction and removing it are both changes. Make them one at a time.",
      "Fake scarcity ('Only 3 left!' when you have unlimited stock). Repeat visitors notice. It destroys trust permanently and is increasingly detected by ad platforms.",
      "Ignoring page speed. A 1-second delay in mobile load time reduces conversions by 7%. Most Shopify stores with slow load times have simply never compressed their images.",
      "Skipping the cart abandonment sequence. This is recoverable revenue that costs zero in ad spend. If you have it active and working, you have a permanent revenue stream running in the background.",
    ],
    checklist: [
      "Microsoft Clarity installed and 10 session recordings watched",
      "Google PageSpeed mobile score checked — above 70 or images compressed",
      "Add to Cart button visible without scrolling on a phone",
      "Cart abandonment email sequence live in Klaviyo (3 emails: 1hr, 24hr, 72hr)",
      "1,000-visitor funnel metrics reviewed and biggest drop-off stage identified",
      "First A/B test running (headline or hero image)",
    ],
    resources: [
      { label: "Microsoft Clarity — free heatmaps", url: "https://clarity.microsoft.com" },
      { label: "Google PageSpeed Insights", url: "https://pagespeed.web.dev" },
      { label: "Shopify Analytics", url: "https://www.shopify.com/analytics" },
    ],
  },

  {
    id: 10,
    title: "Build Your Email List",
    duration: "~35 min",
    objective:
      "Build the only marketing asset you truly own — and set up the automated email flows that generate revenue on autopilot, permanently.",
    concepts: [
      {
        title: "Email is the only traffic you own",
        body: "Ad platforms can ban your account tomorrow. TikTok can change its algorithm. Your email list cannot be taken from you and costs nothing to send to. Every business that survives long-term has email as its backbone. Building it from day one is not optional.",
      },
      {
        title: "Skip the 10% discount popup — here's why",
        body: "A 10% discount popup trains every future visitor to wait for a discount before buying. A better alternative: offer a free value-add that your customer actually wants — a guide ('The 5-minute home workout that actually works'), a checklist, or exclusive early access. This attracts higher-quality subscribers who haven't already extracted a discount before they buy.",
      },
      {
        title: "Email benchmarks you should measure against",
        body: "Welcome series open rate: 50%+ (if below 40%, check your subject lines and sender name). Campaign open rate: 20%+ (below 15% means list fatigue or deliverability issues). Click rate: 2%+ (below 1% means the email content doesn't match what subscribers signed up for). Revenue per email sent: $0.10–$0.50 when you're starting out — experienced operators hit $1–3+.",
      },
      {
        title: "Segment by behavior, not demographics",
        body: "Most beginners create segments like 'women 25–40.' High-performing email programs segment by behavior: Subscribers who haven't bought (nurture sequence), first-time buyers (post-purchase sequence), repeat buyers 2+ times (VIP sequence), high spenders (exclusive offers). These segments outperform demographic segments by 3–5× in revenue.",
      },
      {
        title: "The VIP flow is your highest LTV lever",
        body: "After a customer buys for the second time, trigger a VIP welcome sequence. Email 1: 'You're officially a VIP — here's what that means.' Email 2: Early access to a new product or exclusive bundle. Email 3: Personal thank-you from the founder + request for feedback. Customers who receive this flow buy again at 2× the rate of those who don't.",
      },
      {
        title: "Subject line formulas that actually open",
        body: "Curiosity gap: 'The one thing we wish we'd told you sooner.' Social proof: '482 people bought this last week.' Direct value: 'Your 10% off expires tonight.' Personal: '[First name], this is for you.' Fear of missing out: 'This is going away in 48 hours.' Use these as templates — plug in your product and customer context, never copy generic subject lines.",
      },
    ],
    steps: [
      "Sign up for Klaviyo at klaviyo.com. The free plan covers up to 250 contacts and 500 emails/month — enough to learn and grow. Connect it to your Shopify store inside Klaviyo's integrations panel.",
      "Replace the 10% discount popup with a value-led offer. Create a simple PDF guide or checklist in Canva that solves one specific problem for your customer. Offer it in exchange for an email. Set up the popup to appear after 5 seconds or on exit intent.",
      "Activate the Welcome Series flow. Klaviyo has a pre-built template. Customize: Email 1 (immediate): welcome + deliver your free resource + introduce the brand. Email 2 (day 2): share your brand story or the problem you solve. Email 3 (day 4): social proof + best-selling product + clear CTA.",
      "Activate the Abandoned Cart flow in Klaviyo (pre-built template). Customize the subject lines and add your product-specific social proof in Email 2.",
      "Activate the Post-Purchase flow: Email 1 (day 1): thank you + what to expect. Email 2 (day 5): how to get the best results from your product. Email 3 (day 14): ask for a review (with a direct link to your review app). Email 4 (day 21): recommend a complementary product.",
      "Create your first behavioral segment in Klaviyo: 'Placed order — at least once.' Use this segment for your VIP flow trigger.",
      "Set up the VIP flow: trigger fires when a customer places their second order. Email 1: VIP acknowledgment. Email 2: exclusive access or offer. Email 3: feedback request.",
      "Send your first manual campaign to your full list — a useful niche tip or piece of content, not a sales pitch. This builds the relationship before you ask for another purchase.",
    ],
    mistakes: [
      "Only emailing subscribers when you want to sell something. People unsubscribe when every email has a CTA. The 80/20 rule applies: 80% value, 20% selling.",
      "Skipping the welcome sequence because 'you don't have much to say yet.' The welcome series has the highest open rates of anything you'll ever send — 50–70% on the first email is normal. Don't leave that attention unused.",
      "Not cleaning your list every 90 days. Inactive subscribers reduce your open rate, hurt your deliverability score, and cost you money once you leave the free Klaviyo tier. Remove anyone who hasn't opened in 90 days.",
      "Sending emails with no visual structure. No images, walls of text, inconsistent formatting. Use Klaviyo's built-in email editor with a simple single-column layout. Clean and readable beats fancy every time.",
    ],
    checklist: [
      "Klaviyo connected to Shopify and receiving real subscriber data",
      "Value-led email capture offer live on store (guide, checklist, or exclusive access)",
      "Welcome Series active (3 emails: day 0, day 2, day 4)",
      "Abandoned Cart flow active (3 emails: 1hr, 24hr, 72hr)",
      "Post-Purchase flow active (4 emails over 21 days, including review request)",
      "VIP flow set up and triggered on second purchase",
      "First manual campaign sent to full list",
    ],
    resources: [
      { label: "Klaviyo — email marketing for ecommerce (free to 250)", url: "https://www.klaviyo.com" },
      { label: "Privy — popup and form builder", url: "https://go.privy.com/NYUtfS6" },
    ],
  },

  {
    id: 11,
    title: "Make Your First Sale",
    duration: "~20 min",
    objective:
      "Execute a structured 48-hour launch sequence, respond correctly when the first sale arrives, and use a diagnostic framework to fix the funnel if sales don't come.",
    concepts: [
      {
        title: "The first sale is proof of concept, not luck",
        body: "When your first sale comes in, it means at least one person found your product credible enough to hand over their money. That's not small. It validates your niche, your product, your page, and your offer. Your only job now is to understand what worked and do more of it.",
      },
      {
        title: "The 48-hour launch sequence",
        body: "The 48 hours before turning ads on determines how well your launch goes. A checklist-driven pre-launch prevents the most common causes of lost first sales: pixel not firing, Klaviyo flows not active, mobile checkout broken, test order not placed. Operators who launch with everything confirmed don't have to waste ad spend debugging basic setup errors.",
      },
      {
        title: "Post-sale data is your most valuable asset",
        body: "Record every detail of your first sale in a spreadsheet: which ad, which audience, which creative, day of the week, time of day, ROAS on that day, was there an order bump taken. This is the start of your operating data. After 10 sales, patterns emerge. After 50 sales, you have a playbook.",
      },
      {
        title: "The diagnostic framework: no sale after 2 weeks",
        body: "If you've spent $100–200 with no sales, the problem is one of three things — and you can diagnose which one. CTR below 0.5%: creative problem (the ad isn't stopping the scroll). Add-to-cart rate below 2%: page problem (the product page isn't convincing). Checkout completion below 50%: trust or price problem (something at checkout is creating hesitation).",
      },
    ],
    steps: [
      "Run the full pre-launch checklist 48 hours before turning ads on: pixel firing confirmed (use Pixel Helper extension), Klaviyo flows all active and tested, mobile checkout timed under 2 minutes, test order placed and refunded, DSers/Zendrop fulfillment connection verified.",
      "Confirm your ad is live and budget is set correctly (refer to Module 8). Check that the destination URL goes to your funnel landing page, not your homepage.",
      "Set a daily 10-minute morning ritual: check Shopify for new orders, check ad spend vs. revenue, check any Klaviyo flow errors.",
      "When the first sale arrives: confirm the order in Shopify, verify fulfillment triggered automatically in DSers/Zendrop, send a personal thank-you email to that customer within 1 hour (manually, not a template — make it human), add them to your 'Customer' segment in Klaviyo.",
      "Record the first sale data in a spreadsheet: source (which ad/organic video), audience, creative, day, time, total ad spend that day, ROAS.",
      "Immediately after your first sale: identify the winning creative and set up a duplicate ad set with 20% higher budget (Module 8 winner duplication method). The goal is now your second sale.",
      "If no sale after 14 days and $150+ in ad spend: apply the diagnostic framework. Pull CTR from your ad platform. Pull add-to-cart rate from Shopify Analytics. Pull checkout completion from Shopify. Fix the broken metric — only one at a time.",
    ],
    mistakes: [
      "Launching ads without confirming your pixel is firing. You will spend $100 with no data. This takes 5 minutes to check — do it.",
      "Panicking and changing your funnel, your ads, and your product page all in the same week. When everything changes at once, you learn nothing. Fix one thing, observe for 3 days, then fix the next thing.",
      "Not fulfilling the first order within 24 hours. Your customer is excited. A delayed fulfillment notification, or worse, a 'where is my order?' email, destroys the experience that should produce your first 5-star review.",
      "Ignoring the post-sale thank-you. A personal email within 1 hour of a first sale has a 90%+ open rate. It's the beginning of a customer relationship — treat it accordingly.",
    ],
    checklist: [
      "Pre-launch checklist completed: pixel confirmed, flows active, mobile checkout timed, test order placed",
      "Ads live with correct destination URL (funnel page, not homepage)",
      "Daily 10-minute morning review routine started",
      "First sale received, fulfilled, and personally acknowledged within 1 hour",
      "First sale data recorded in spreadsheet (source, creative, spend, ROAS)",
      "Winner duplication or diagnostic framework applied based on results",
    ],
  },

  {
    id: 12,
    title: "Scale and Grow",
    duration: "~25 min",
    objective:
      "Build a repeatable system for scaling from first sale to consistent daily sales — with specific budget rules, LTV math, and a clear milestone map for your first 90 days.",
    concepts: [
      {
        title: "The 3-month milestone map",
        body: "Month 1 goal: get your first sale and break even on ad spend. Month 2 goal: consistent daily sales with ROAS above 2.5. Month 3 goal: profitable at scale, second product identified, email list at 500+ subscribers. These milestones are not arbitrary — each one requires a different focus. Trying to do Month 3 work in Month 1 is one of the most common reasons beginners burn out.",
      },
      {
        title: "The exact budget scaling rule",
        body: "Increase your ad budget by 20% every 3 days if ROAS stays above your target. Never double a budget overnight — the algorithm's learning phase resets and performance drops for 3–5 days, often permanently ruining a winning campaign. 20% every 3 days sounds slow but compounds to a 10× budget increase in 30 days while maintaining performance.",
      },
      {
        title: "LTV math: what a customer is actually worth",
        body: "Lifetime Value determines how much you can afford to acquire a customer. Example: your average customer buys 1.4 times in 90 days at $45 per order. LTV = $63. This means you can spend up to $63 to acquire a customer and break even over 90 days. If your current cost per acquisition is $30, you have $33 of headroom to scale before going unprofitable. Calculate this number now and revisit it every 30 days.",
      },
      {
        title: "The second product rule",
        body: "Launch a second product only when: your first product has been consistently profitable (ROAS above 2.0 for 30+ consecutive days), you have at least 100 buyers in Klaviyo to survey about what they want next, and the new product serves the exact same avatar and could be bought by the same customer. Launching a second product too early splits your attention and usually kills both.",
      },
      {
        title: "Branded store vs. product store: the valuation difference",
        body: "If you ever want to sell your store, the difference between a product store and a brand is enormous. Product stores (no distinct brand identity, generic name, no repeat purchase infrastructure) sell for 1–2× annual profit. Branded stores (recognizable name, logo, loyal customer base, strong email list, repeat purchase rate above 20%) sell for 3–4× annual profit. Build the brand from day one — it's the same work, just done with intention.",
      },
      {
        title: "Amazon FBA as your second channel",
        body: "Once you have consistent sales and proven demand, Amazon FBA is the natural second channel. You ship inventory to Amazon's warehouses; they fulfill orders. The key difference: on Amazon you optimize for organic ranking and reviews, not ads. Customers are already looking to buy — they just need to find you. A product with 200 Shopify sales can launch on Amazon with built-in social proof and often break even in the first 30 days.",
      },
    ],
    steps: [
      "Calculate your LTV: pull your last 90 days of Shopify order data. Find average orders per customer and average order value. Multiply them. Write this number down. It changes your entire view of what you can afford to spend on ads.",
      "Define your personal month-by-month milestone goals using the 3-month map. Write them somewhere you review daily — not in this app, in a physical place.",
      "Apply the 20% budget scaling rule to your current winning ad set. Calculate what your daily budget should be at day 3, day 6, day 9, and day 30 if ROAS holds. Write it down so you're not making emotional decisions during scaling.",
      "Survey your first 100 buyers. Use a simple Google Form. Ask: What do you love about the product? What would make it better? What else do you wish we sold? What's your biggest [niche] problem right now? The answers tell you your second product.",
      "Calculate the break-even ROAS for your business: Total cost per order (product + shipping + apps) divided by your selling price. If your product costs $15 landed and you sell it for $45, break-even ROAS = $45 ÷ ($45 − $15) = 1.5. You need to exceed 1.5 ROAS to be profitable. Know this number before scaling.",
      "If you are at consistent daily sales after 60 days: research Amazon FBA for your hero product. Check the category on Jungle Scout. If your product sells well there, it's a signal to expand.",
      "Start building brand equity now: consistent visual identity, a real About page with a founder story, packaging inserts (if private labeling), and a brand voice in your emails. This is what makes your business worth something beyond its revenue.",
    ],
    mistakes: [
      "Adding a second product before your first is consistently profitable. Split attention kills both products. Discipline here separates winners from hobbyists.",
      "Scaling ad budget too fast. Doubling from $50/day to $100/day overnight resets the algorithm's learning phase — you often see a 2–3 day performance drop that beginners mistake for the ad dying.",
      "Ignoring your existing customers while chasing new ones. Your past buyers are 9× more likely to purchase again than cold traffic. Neglecting email, neglecting the VIP flow, and never mailing your list is leaving money on the table every single day.",
      "Trying to be on every platform at once. Two channels maximum in year one — go deep before you go wide. Mastery compounds faster than surface-level presence on 5 platforms.",
    ],
    checklist: [
      "LTV calculated and written down (average orders per customer × average order value)",
      "Break-even ROAS calculated for my product",
      "Personal 3-month milestone map written down",
      "20% budget scaling schedule planned in advance",
      "First 100-buyer survey sent or scheduled",
      "Brand identity elements in place: logo, color palette, about page, founder story",
    ],
    resources: [
      { label: "Shopify Analytics — revenue and customer data", url: "https://www.shopify.com/analytics" },
      { label: "Triple Whale — advanced ecommerce attribution", url: "https://www.triplewhale.com" },
      { label: "Jungle Scout — Amazon product research", url: "https://www.junglescout.com" },
    ],
  },

  // ─────────────────────────────────────────────
  // SCALE LAB — GROWTH MODULES (13–24)
  // For users who got their first sale and want consistent revenue.
  // Tier: "growth" ($49/month, gated by user_profiles.is_growth)
  // ─────────────────────────────────────────────

  {
    id: 13,
    tier: "growth",
    title: "Why Your First Sales Won't Repeat",
    duration: "~30 min",
    objective:
      "Understand why early sales feel random — and why most 'winners' at low volume are actually noise. Stop trusting the lottery; start trusting the data.",
    concepts: [
      {
        title: "Survivorship bias kills beginners",
        body: "When you scroll TikTok and see 'I made $10k in 30 days dropshipping', you're seeing the 1 winner out of 10,000 attempts. The 9,999 losers don't post videos. The first sales you make follow the same statistical reality — they're survivors of dozens of impressions you didn't track. Treating them as proof of a winning system is exactly how stores blow money scaling something that was always going to fail.",
      },
      {
        title: "The noise problem at low volume",
        body: "At fewer than ~30 conversions per variant, you cannot distinguish a real winner from random luck. A 2% conversion rate vs a 4% rate looks like the second is 'twice as good' — but with only 50 visits each, the confidence interval is so wide you'd need 10x more traffic to know. Source: any A/B testing primer; Experimentation Works covers this in depth.",
      },
      {
        title: "The repeatability test",
        body: "A real winner produces sales week 2 with similar inputs — not just week 1. If you ran a $20 ad and got 3 sales, that's the lottery. If you ran the same ad for 14 days at consistent spend and got proportional sales the whole time, that's a system. Most beginners scale based on week 1 and get crushed in week 3.",
      },
      {
        title: "Lucky money vs skill money",
        body: "Lucky money (random first sales) feels identical to skill money (repeatable system) when it lands in your account. The difference: only one is predictive. Until you can answer 'if I spend $100 tomorrow, how many sales will I make?' within ±20%, you don't have a business — you have a one-time event.",
      },
    ],
    steps: [
      "Pull your last 30 days of sales data from Shopify. Sort by date. Look at the gaps between sales.",
      "For each sale, write down: which ad/source drove it, your ad spend that day, and your CPM/CTR/CPC. If you can't fill any column, that's your first lesson — you're not tracking.",
      "Calculate: of your sales, how many came from the same product + creative combo? Scattered winners across 5 products = lucky portfolio, not a winner.",
      "Run the repeatability test: pick your single best ad and run it for 7 more days at the same daily budget. Document results.",
      "Answer one question: 'If I spend $50 on ads tomorrow, how many sales should I expect?' If the answer is 'I don't know' or 'anywhere from 0 to 10', continue to Module 14.",
    ],
    mistakes: [
      "Scaling a campaign after 2–3 sales because the ROAS looks good — at that volume, ROAS is meaningless noise.",
      "Killing a campaign after 1 day with no sales — sample is too small to conclude anything.",
      "Looking at your best sales day and assuming it's normal — outliers fool everyone.",
      "Switching products every week because 'this one didn't work' without giving any product enough volume to validate.",
      "Reading TikTok success videos as data — they're lottery winners with cameras.",
    ],
    checklist: [
      "I have a spreadsheet of every sale from the last 30 days with source attribution",
      "I've identified which sales came from the same product + creative combo",
      "I've run my best ad for at least 7 consecutive days at consistent budget",
      "I can explain to a friend the difference between 'I had a winner' and 'I had a lucky day'",
      "I've written down what daily spend produces what daily sales — and how confident I am in that estimate",
    ],
    resources: [
      { label: "Experimentation Works (Stefan Thomke)", url: "https://www.amazon.com/Experimentation-Works-Surprising-Power-Business/dp/1633697100" },
      { label: "A/B Test Significance Calculator", url: "https://www.surveymonkey.com/mp/ab-testing-significance-calculator/" },
      { label: "Hacking Growth (Sean Ellis) — high-tempo testing", url: "https://www.amazon.com/Hacking-Growth-Fastest-Growing-Companies-Breakout/dp/045149721X" },
    ],
  },

  {
    id: 14,
    tier: "growth",
    title: "The Numbers That Actually Matter",
    duration: "~40 min",
    objective:
      "Build a dashboard of the 8 metrics that actually drive an ecommerce business — and the thresholds that tell you whether each is healthy, marginal, or dying.",
    concepts: [
      {
        title: "Two layers: platform metrics vs business metrics",
        body: "Platform metrics live inside Meta/TikTok ads manager: CPM, CTR, CPC, hook rate, ad ROAS. Business metrics live in your Shopify dashboard or P&L: AOV, contribution margin, blended ROAS, refund rate, LTV. Beginners optimize platform metrics. Pros optimize business metrics. The two often disagree — Meta says ROAS 2.4 (great!), but blended P&L says you lost money this month.",
      },
      {
        title: "The 8 metrics every operator tracks",
        body: "CPM (cost per 1000 impressions, healthy $10–20). CTR (click-through rate, healthy 1.5%+). CPC (cost per click, healthy <$1). CR (store conversion rate, healthy 2.5%+). CPA (cost per acquisition, must be < contribution margin). AOV (average order value). Contribution margin = AOV − COGS − shipping − fees − ad cost. Blended ROAS = total revenue ÷ total ad spend across ALL channels — always more accurate than platform ROAS.",
      },
      {
        title: "The North Star Metric",
        body: "From Sean Ellis's Hacking Growth. You can't manage 8 metrics daily. Pick ONE that summarizes everything. For most ecommerce stores, the NSM is profitable orders per day — orders where contribution margin > 0 after ad spend. Track that one number daily; everything else is diagnostic.",
      },
      {
        title: "Thresholds, not vanity",
        body: "Don't ask 'is this CTR good?' — ask 'is this CTR above the threshold I need to be profitable?' Your real CTR target is whatever produces your target CPC at your current CPM. Calculate backwards from your contribution margin.",
      },
    ],
    steps: [
      "Build a Google Sheets dashboard. Columns: Date, Spend, Impressions, Clicks, Sessions, Add-to-Cart, Checkout, Purchases, Revenue, COGS, Shipping, Fees, Refunds, Contribution Margin.",
      "Set up daily auto-population (Shopify export + Meta/TikTok export, or use Triple Whale / Polar / Lifetimely).",
      "Calculate target metrics by working backwards: pick a target contribution margin (e.g. $15/order), work back to required CPA, then CR, then CPC, then CPM/CTR.",
      "Add a 'verdict' column to each ad/campaign: GREEN (above threshold), YELLOW (at threshold), RED (below). Update daily.",
      "Track NSM (profitable orders/day) on the top line. Set a 7-day rolling average.",
      "Stop reading platform ROAS in isolation. Always pair it with blended ROAS from your P&L.",
    ],
    mistakes: [
      "Watching CPM obsessively but ignoring CR — your store could be the bottleneck, not your ads.",
      "Believing platform ROAS — Meta over-reports by 20–50% post-iOS17 due to lost attribution.",
      "Tracking metrics without thresholds — a number is useless without knowing what's 'good' for your margin.",
      "Optimizing for ROAS instead of contribution margin — a 3.0 ROAS on a $20 product with $15 COGS is unprofitable.",
      "Updating dashboards weekly instead of daily — slow feedback = slow learning.",
    ],
    checklist: [
      "I have a dashboard with all 8 core metrics, updated daily",
      "I've calculated my required CPA, CTR, CPC, and CR thresholds based on my contribution margin",
      "I have a North Star Metric posted somewhere I see every day",
      "I track blended ROAS from my P&L, not just platform ROAS",
      "Every ad has a GREEN/YELLOW/RED verdict updated each morning",
      "I know my contribution margin per order to the cent",
    ],
    resources: [
      { label: "Triple Whale — best ecommerce attribution dashboard", url: "https://www.triplewhale.com/" },
      { label: "Northbeam — alternative for $50k+/mo stores", url: "https://www.northbeam.io/" },
      { label: "Lifetimely — Shopify P&L + LTV (free tier)", url: "https://lifetimely.io/" },
      { label: "Hacking Growth (Sean Ellis) — North Star Metric chapter", url: "https://www.amazon.com/Hacking-Growth-Fastest-Growing-Companies-Breakout/dp/045149721X" },
    ],
  },

  {
    id: 15,
    tier: "growth",
    title: "The Profit Audit: Are You Actually Making Money?",
    duration: "~35 min",
    objective:
      "Run a true 30-day P&L on your store. Most 'profitable' beginner stores actually lose money once refunds, fees, and true CPA are counted. Find out which side you're on.",
    concepts: [
      {
        title: "The 4 hidden costs that wreck beginner P&Ls",
        body: "Refunds & chargebacks (5–15% of revenue depending on niche — almost no beginner deducts these). Transaction fees (Shopify Payments + currency conversion + Stripe = 3–4% on average). Returned inventory loss (for non-dropship: returned units that can't be resold). Apps & tools (Shopify subscription + app stack + email tool + ad spy tool = $200–500/mo).",
      },
      {
        title: "Platform ROAS lies post-iOS17",
        body: "Apple's privacy changes mean Meta and TikTok over-attribute conversions. A reported ROAS of 3.0 in Meta is often closer to 2.0 in reality. The only honest number is blended ROAS: total revenue from your Shopify ÷ total ad spend across all platforms.",
      },
      {
        title: "The contribution margin formula",
        body: "Per-order: Sell price − COGS − shipping cost − transaction fee − ad cost per order. If positive, you make money on that order. If you've never written this formula on paper for your hero product, do it before you spend another dollar on ads.",
      },
      {
        title: "The 30-day truth window",
        body: "Why 30 days? Refunds typically arrive 7–30 days after purchase. A 7-day P&L makes you look profitable; the same period at day 30 is the truth. Always use a closed 30-day window for real audits.",
      },
    ],
    steps: [
      "Pick a 30-day window from at least 30 days ago (so refunds have come in). Pull every line item from Shopify, all ad platforms, and bank statements.",
      "Calculate total revenue (gross sales − refunds − discounts).",
      "Calculate total COGS (sum of supplier cost + shipping cost for every delivered order).",
      "Calculate total transaction fees (Stripe + Shopify Payments + currency conversion).",
      "Calculate total ad spend (Meta + TikTok + Google + any other source).",
      "Calculate total app/tool costs (everything paid monthly for the store).",
      "True profit = Revenue − COGS − Fees − Ad Spend − Tools. Write this number down. Sit with it.",
      "If profit is negative, focus on profitability before scaling — the rest of this tier is your roadmap.",
    ],
    mistakes: [
      "Using gross sales (no refund deduction) and calling it 'revenue'.",
      "Ignoring transaction fees — they're 3–4% and they compound.",
      "Counting Meta's reported revenue figure (over-attributed by 20–50%).",
      "Forgetting that one-time ad fatigue periods spike CPA and gut your margin.",
      "Not running this audit because 'it'll just be depressing' — the only thing more depressing is scaling unprofitably for 6 months.",
    ],
    checklist: [
      "I have a complete 30-day P&L on paper or spreadsheet",
      "I've deducted refunds, chargebacks, and transaction fees",
      "I've used blended ROAS, not platform ROAS",
      "I know my true contribution margin per order",
      "I know whether my last 30 days were profitable or not, in real numbers",
      "If unprofitable, I've identified WHICH of the 4 hidden costs hit hardest",
    ],
    resources: [
      { label: "Lifetimely — free 30-day P&L for Shopify", url: "https://lifetimely.io/" },
      { label: "Triple Whale — closer-to-truth attribution", url: "https://www.triplewhale.com/" },
      { label: "Ecommerce Evolved (Tanner Larsson)", url: "https://www.amazon.com/Ecommerce-Evolved-Essential-Playbook-Customers/dp/1535258543" },
    ],
  },

  {
    id: 16,
    tier: "growth",
    title: "Real Winners vs Fake Signals",
    duration: "~35 min",
    objective:
      "Apply a rigorous validation method to every 'winning' product or ad before you scale it. Filter out the lottery wins from the genuine repeatable systems.",
    concepts: [
      {
        title: "The 3-day vs 7-day truth",
        body: "Day 1–3 metrics are ad-platform algorithm warm-up + lucky audience hits. Day 4–7 is when the algorithm settles. Never make scale decisions before day 7 — you're decisioning on noise.",
      },
      {
        title: "The 100-click rule",
        body: "Any new variant (creative, audience, landing page) needs at least 100 clicks before you can claim 'it doesn't convert.' With 50 clicks at 2% baseline CR, you'd expect 1 sale ± 1 — meaning 0 or 2 are both consistent with the same underlying truth. 100 clicks gives you a usable signal; 300+ gives you confidence.",
      },
      {
        title: "The repeatability test",
        body: "A real winner produces consistent sales week-over-week at the same daily budget (±25%), consistent CTR & hook rate across at least 2 audiences, and at least 30 conversions before you call it 'validated.' If your 'winner' only worked when you launched it on a Friday at 6pm, it's not a winner.",
      },
      {
        title: "Hook rate as the early indicator",
        body: "Hook rate = % of viewers who watch past 3 seconds. This metric stabilizes earlier than CTR or CPA because it requires far fewer impressions. A 30% hook rate with low CTR = creative is good but the message after the hook is wrong. A 10% hook rate = scroll-stopping isn't working, full stop.",
      },
    ],
    steps: [
      "List every 'winner' you've called out in the last 60 days. For each, write down total impressions, clicks, sales, ad spend.",
      "Apply the 100-click rule retroactively. Any 'winner' with <100 clicks gets demoted to 'unproven.'",
      "Check the 7-day window: did sales stay consistent across 7 days at consistent spend?",
      "Check the 2-audience test: did the same creative work for at least 2 distinct audiences (interest-based AND broad)? If only one audience, you may have audience-specific noise.",
      "Promote winners that pass both tests. Demote everything else to 'needs more data.'",
      "For unproven candidates: add budget, run for 7 more days, re-test.",
    ],
    mistakes: [
      "Scaling a creative after 1 viral day because 'it's working'.",
      "Killing a creative after 24h of no sales when you have <50 clicks.",
      "Treating 'platform ROAS 5.0 over 2 days' as proof — sample size is the issue.",
      "Not checking hook rate separately from CTR — they fail for different reasons.",
      "Believing that 'the algorithm needs 3 days to learn' as an excuse to keep losers running for a week.",
    ],
    checklist: [
      "I've audited every claimed 'winner' against the 100-click rule",
      "I've checked 7-day consistency, not just 2–3 day spikes",
      "I've tested each winner across 2 different audiences",
      "I track hook rate separately as an early signal",
      "I have a clear 'validated' vs 'unproven' status for every active creative",
      "I've demoted at least one 'winner' after applying these rules",
    ],
    resources: [
      { label: "Foreplay — ad library + creative analytics", url: "https://www.foreplay.co/" },
      { label: "Motion App — creative analytics with hook rate", url: "https://motionapp.com/" },
      { label: "Experimentation Works (Stefan Thomke) — false positives", url: "https://www.amazon.com/Experimentation-Works-Surprising-Power-Business/dp/1633697100" },
    ],
  },

  {
    id: 17,
    tier: "growth",
    title: "Engineering the Offer (Beyond the Product)",
    duration: "~40 min",
    objective:
      "Stop optimizing the product. Start engineering the offer. The offer (product + price + bundle + bonus + risk reversal) is what converts. Two stores selling the same product with different offers see 3–5x different conversion rates.",
    concepts: [
      {
        title: "Product ≠ Offer",
        body: "Your product is what you ship. Your offer is everything wrapped around it: price anchor, bundle composition, bonus items, urgency, scarcity, risk reversal (guarantee), shipping terms, payment terms. A $40 product with a 30-day money-back guarantee and free shipping at $50+ converts dramatically better than the same product at $40 alone.",
      },
      {
        title: "Hormozi's value equation",
        body: "Value = (Dream outcome × Perceived likelihood) ÷ (Time delay × Effort & sacrifice). Increase perceived value by: making the dream outcome more tangible, adding proof to raise perceived likelihood, reducing time-to-result, reducing required effort. Most beginners only manipulate price. Pros manipulate all four.",
      },
      {
        title: "The 5 offer levers",
        body: "Bundles (2-pack, 3-pack — increases AOV and perceived value). Bonuses (free e-book, free shipping, additional product). Risk reversal (money-back guarantee, free returns, '30-day try'). Urgency/scarcity ('ends Friday', 'only 12 left', launch pricing). Payment flexibility (Klarna, Afterpay, Shop Pay Installments — increases conversion 10–25% on $50+).",
      },
      {
        title: "The ladder of offers",
        body: "A great store has 3 offer tiers visible at checkout: Single ($40), Bundle of 2 ($72, save 10%), Bundle of 3 ($96, save 20% + bonus). Without the ladder, customers default to cheapest. With the ladder, ~40% trade up.",
      },
    ],
    steps: [
      "Write down your current offer in one paragraph. Include: product, price, shipping policy, guarantee, any bonuses.",
      "Score it against Hormozi's 4 variables (1–10 each). Where are you weakest?",
      "Build 3 offer variants: (A) same product + 30-day guarantee + free shipping over $50; (B) bundle of 2 at 10% off with bonus; (C) 3-pack at 20% off with urgency timer.",
      "Run a 7-day split test: Variant A vs current offer. Track AOV and CR separately.",
      "Add Klarna or Shop Pay Installments if your AOV is over $50.",
      "Document which variant won and apply learnings to your next launch.",
    ],
    mistakes: [
      "Treating price as the only lever — too cheap looks like junk; too expensive without a value stack just loses.",
      "Adding a guarantee in tiny grey text at the bottom — make it loud, anchor the offer.",
      "Bundles without genuine savings — customers can do math; a 'fake 20% off' gets spotted.",
      "Scarcity that's obviously fake ('Only 3 left!' forever) — kills trust.",
      "Building a complex offer with 5 bonuses no one cares about. Better: one strong bonus tied to the product's main value.",
    ],
    checklist: [
      "I've written my current offer in one paragraph",
      "I've scored it against Hormozi's value equation",
      "I've designed 3 offer variants",
      "I've launched at least one offer test",
      "I have payment installments enabled if my AOV > $50",
      "I have a clearly visible guarantee on the product page",
    ],
    resources: [
      { label: "$100M Offers (Alex Hormozi)", url: "https://www.acquisition.com/100m-offers" },
      { label: "Klarna for Shopify", url: "https://www.klarna.com/business/shopify/" },
      { label: "Bold Bundles — Shopify bundle pricing app", url: "https://apps.shopify.com/product-bundles" },
      { label: "The 1-Page Marketing Plan (Allan Dib)", url: "https://www.amazon.com/1-Page-Marketing-Plan-Customers-Money/dp/1989025013" },
    ],
  },

  {
    id: 18,
    tier: "growth",
    title: "Increasing AOV Without Increasing Cost",
    duration: "~30 min",
    objective:
      "Engineer 3–5 mechanisms that increase AOV by 20–40% from the same traffic. Higher AOV with same traffic = higher contribution margin overnight, which means you can outbid competitors on ads and still profit.",
    concepts: [
      {
        title: "The math of AOV",
        body: "If your AOV is $40 with $25 contribution margin, you can spend up to $25 to acquire a customer. Raise AOV to $60 (with $40 margin) and you can spend up to $40 — a 60% bigger ad budget per customer, meaning you can win more auctions on Meta/TikTok and out-scale competitors at the same ROAS target. Raising AOV is the highest-leverage profit move in ecommerce.",
      },
      {
        title: "The 4 AOV mechanisms (in order of ease)",
        body: "Free shipping threshold (set 30–50% above current AOV; customers add an item to qualify; 5-min implementation). Order bumps (small add-on at checkout — insurance, gift wrap, complementary product at $7–15). Post-purchase upsells (one-click add an item AFTER they've paid — ReConvert app converts 15–25%). Bundles & quantity discounts (pre-built 2-pack 10% off, 3-pack 20% off on the product page).",
      },
      {
        title: "Where each captures different psychology",
        body: "Free shipping threshold = loss aversion. Order bumps = effort minimization (one click, already in flow). Post-purchase upsell = commitment & consistency (already proven willing to buy). Bundles = anchor pricing (3-pack makes 2-pack feel reasonable). The combo is stronger than any single one.",
      },
      {
        title: "The realistic uplift",
        body: "A store with all 4 mechanisms running well typically sees AOV climb 25–50% from baseline. A store with none is leaving 25%+ profit on the table.",
      },
    ],
    steps: [
      "Calculate current AOV. Set a free shipping threshold at 1.4x AOV (e.g., AOV $40 → free shipping at $55).",
      "Add one order bump at checkout: pick something complementary at $9–15 (ReConvert or Bold Upsell).",
      "Add one post-purchase upsell: same buyer, one-click add. Pick your second-best product, discount it 10%.",
      "Build one bundle: 2-pack at 10% off, 3-pack at 20% off. Display on product page using a quantity selector or app.",
      "Test in order: free shipping (week 1), order bump (week 2), post-purchase (week 3), bundle (week 4). Track AOV change each week.",
      "After 4 weeks, calculate cumulative AOV uplift and how much extra ad spend you can now afford per customer.",
    ],
    mistakes: [
      "Setting free shipping threshold too low (no extra revenue) or too high (customers abandon).",
      "Order bump that's irrelevant — must complement the main product.",
      "Post-purchase upsell that re-asks for payment — should be one-click using stored payment.",
      "Bundles with token discounts (5% off feels like nothing — minimum 10% to register as a deal).",
      "Adding all 4 at once — you can't tell which moved the needle.",
    ],
    checklist: [
      "Free shipping threshold set at 1.4x AOV",
      "Order bump live at checkout",
      "Post-purchase upsell active",
      "At least one product with 2-pack and 3-pack bundle pricing",
      "AOV uplift measured over a 4-week test",
      "I've recalculated my max CPA based on new AOV",
    ],
    resources: [
      { label: "ReConvert Post-Purchase Upsells", url: "https://apps.shopify.com/reconvert-upsell-cross-sell?mref=bfgeliiu" },
      { label: "Bold Bundles", url: "https://apps.shopify.com/product-bundles" },
      { label: "Vitals — 40+ conversion apps in one", url: "https://vitals.co/" },
      { label: "$100M Offers (Hormozi) — Value Stack chapter", url: "https://www.acquisition.com/100m-offers" },
    ],
  },

  {
    id: 19,
    tier: "growth",
    title: "Persuasion Foundations: The 6 Principles That Sell Anything",
    duration: "~45 min",
    objective:
      "Master Cialdini's 6 universal persuasion principles and audit your current ads, product page, and emails against them. Most beginner copy uses 1–2 of the 6; pro copy weaves in 5–6.",
    concepts: [
      {
        title: "Reciprocity",
        body: "Humans feel obligated to return favors. Application: lead with value before asking for the sale. Free e-book, free trial, free chapter, free shipping, free strategy guide. Givers receive — but only if they give first. (Source: Cialdini, Influence.)",
      },
      {
        title: "Commitment & Consistency",
        body: "Once we publicly commit to something, we behave consistently with it. Application: quizzes ('answer 3 questions and we'll match you with the right product') build commitment before the ask. Tiny yes → bigger yes → purchase.",
      },
      {
        title: "Social proof",
        body: "When uncertain, we copy others. Application: '10,000 happy customers.' Real photo reviews. UGC videos showing real people using the product. Customer count badges. Without social proof, your ad is one stranger telling another stranger what to do.",
      },
      {
        title: "Authority",
        body: "We defer to experts. Application: doctor reviews, certifications ('ISO certified'), media features ('As seen in Forbes'), founder credentials. Even sub-symbolic authority signals (lab coats in skincare, athletic packaging in fitness) move conversion.",
      },
      {
        title: "Liking",
        body: "We buy from people we like. Application: founder story video, behind-the-scenes content, personal voice in copy ('I built this because I had the same problem'), creators who feel like the customer. UGC works because it's from someone who feels like the audience.",
      },
      {
        title: "Scarcity",
        body: "Things become more valuable when limited. Application: limited stock badges, real countdown timers, launch pricing windows, 'while supplies last', limited edition variants. Caveat: must be real or trust dies.",
      },
    ],
    steps: [
      "Print or screenshot your top-performing ad. Score it 0–2 on each of the 6 principles (0 absent, 1 weak, 2 strong). Write the score on the printout.",
      "Repeat for: product page hero, email welcome flow, checkout page.",
      "Identify your weakest principles. For most beginners: reciprocity, authority, commitment & consistency.",
      "Add ONE missing principle to your ad. Test for 7 days against the original. Track CTR change.",
      "Add ONE missing principle to your product page (commonly: better social proof — real photo reviews or video UGC). Track CR change.",
      "Document which principle moved your numbers most. That's your highest-ROI principle for this product.",
    ],
    mistakes: [
      "Confusing social proof with self-praise — 'this product is great' from yourself is not social proof.",
      "Using fake scarcity ('Only 3 left!' that never updates) — kills trust faster than no scarcity at all.",
      "Ignoring reciprocity entirely — most stores skip it because it requires giving something first.",
      "Token authority signals ('Trust badge: SSL secure') that don't actually move buyers.",
      "Using all 6 principles at maximum intensity — comes across as desperate; pick 3–4 strongest.",
    ],
    checklist: [
      "I've scored my top ad against all 6 principles",
      "I've scored my product page against all 6 principles",
      "I've identified my weakest 2 principles",
      "I've added one missing principle to my ad and tested for 7 days",
      "I've added one missing principle to my product page and tracked CR change",
      "I have a written analysis of which principle moves my conversion most",
    ],
    resources: [
      { label: "Influence: The Psychology of Persuasion (Cialdini)", url: "https://www.influenceatwork.com/" },
      { label: "Pre-Suasion (Cialdini) — sequel on framing", url: "https://www.amazon.com/Pre-Suasion-Revolutionary-Way-Influence-Persuade/dp/1501109790" },
      { label: "Loox — photo & video reviews", url: "https://loox.io/app/FSL30" },
      { label: "Judge.me — review imports + photo reviews (free tier)", url: "https://judge.me" },
    ],
  },

  {
    id: 20,
    tier: "growth",
    title: "The Hook Library: How to Stop the Scroll",
    duration: "~40 min",
    objective:
      "Master the 6 high-performing hook frameworks used in winning ads. Build a personal library of 20+ hooks for your product. The hook (first 3 seconds) determines 70–80% of ad performance.",
    concepts: [
      {
        title: "Why hooks matter so much",
        body: "On TikTok and Reels, viewers decide to keep watching or scroll within 1–3 seconds. Hook rate (% who watch past 3 seconds) is the single most predictive metric for ad performance. A great body with a weak hook gets 0 views. A weak body with a great hook still tests; you can iterate the body.",
      },
      {
        title: "The 6 universal hook frameworks",
        body: "1) Pattern interrupt — visual/audio that's unexpected. 2) Problem agitation — name the pain immediately. 3) Curiosity gap — pose a question that demands resolution. 4) Transformation reveal — show after, then explain. 5) Social proof opener — number, badge, or quote. 6) Contrarian / counterintuitive — challenge a common belief.",
      },
      {
        title: "STEPPS — what makes content spread",
        body: "From Jonah Berger's Contagious. Social currency (does sharing make you look smart). Triggers (does it tie to a daily occurrence). Emotion (high-arousal feelings — awe, anger, surprise — drive sharing). Public (visibility — people copy what they see). Practical value (does it teach something). Stories (humans wired for narrative; stories spread, lists don't). The best hooks embed multiple STEPPS components.",
      },
      {
        title: "The 3-3 rule",
        body: "A hook must work in 3 seconds AND from 3 feet away (mute, low-quality phone screen). If it requires audio or close attention, it fails on TikTok/Reels where most people scroll silently.",
      },
    ],
    steps: [
      "Pick your top 3 winning competitors' ads (Foreplay or Meta Ad Library). Watch the first 3 seconds of each. Categorize: which of the 6 frameworks?",
      "For your own product, write 20 hooks — at least 3 per framework. Quantity first, don't filter yet.",
      "Apply the 3-3 test: mute your phone, hold it at arm's length. Which hooks still work? Cut the rest.",
      "Pick your top 5. Create video drafts (existing UGC footage or simple text-on-video).",
      "Run a 5-variant ad test: same body, same offer, only the hook differs. 7 days at $10/day each = $350 total spend.",
      "Document hook rate (3-second view rate) for each variant. Pick the winner. You now know what hook framework works for your product.",
    ],
    mistakes: [
      "Writing one hook and assuming it's good — you need volume; pros write 30+ before picking.",
      "Hooks that require audio — half your audience has the sound off.",
      "Hooks that bury the lead ('Hi guys, today I want to show you...') — death sentence.",
      "Generic hooks ('Check out this amazing product') — must be specific to product/niche.",
      "Testing hooks for <3 days — hook rate stabilizes fast but conversions need full 7-day window.",
    ],
    checklist: [
      "I've categorized 3 winning competitor ads by hook framework",
      "I've written 20+ hooks for my product",
      "I've applied the 3-3 test and shortlisted to 5",
      "I've created video variants for the top 5",
      "I've run a 7-day, 5-variant hook test",
      "I have data on which hook framework wins for my product",
    ],
    resources: [
      { label: "Contagious: Why Things Catch On (Jonah Berger)", url: "https://jonahberger.com/books/contagious/" },
      { label: "Foreplay — competitor ad library + hook analysis", url: "https://www.foreplay.co/" },
      { label: "Meta Ad Library", url: "https://www.facebook.com/ads/library" },
      { label: "TikTok Creative Center", url: "https://ads.tiktok.com/business/creativecenter" },
    ],
  },

  {
    id: 21,
    tier: "growth",
    title: "UGC at Scale: Sourcing, Briefing, Iterating",
    duration: "~45 min",
    objective:
      "Build a UGC creator pipeline that produces 8–15 ad variants per month at $50–150 per video. UGC outperforms branded content 2–4x on TikTok and Meta in 2026 — but only if you brief creators for performance, not aesthetics.",
    concepts: [
      {
        title: "Why UGC wins",
        body: "Algorithm + audience both prefer it. The algorithm rewards content that doesn't 'feel like an ad' with lower CPMs. The audience trusts it because it looks like organic content. In 2026, branded studio ads are usually outperformed by lo-fi UGC by 30–60% on click-through rate and 2–3x on hook rate.",
      },
      {
        title: "The 3 sourcing channels",
        body: "UGC platforms (Billo, Insense, Trend.io) — fastest, $40–100/video, lower variance. Direct outreach to micro-creators — find creators (1k–50k followers) in your niche, DM with paid offer; higher quality, more management. Customer-generated content — incentivize buyers to send video reviews via Loox or Tolstoy; cheapest, lowest volume.",
      },
      {
        title: "The brief is the work",
        body: "A great UGC creator with a bad brief = generic, unwatchable content. A mediocre creator with a great brief = winners. The brief must specify: exact hook (first 3 seconds, word-for-word), pain point to dramatize, transformation to show, the CTA, format requirements (vertical, no music, lighting, length 15–30s), and 3 reference videos. Don't ask for 'a fun video about the product.' That's how you get 50 unusable variants.",
      },
      {
        title: "Variant production at scale",
        body: "One winning UGC concept can be re-cut into 5–10 ad variants by changing: different hook (same body), different opening 3 seconds, different captions/text overlays, different CTA, different music. This is where Capcut, Munch, or Pebble become essential — multiplying winning content into dozens of ads cheaply.",
      },
    ],
    steps: [
      "Create your first brief: 1-page document with hook (word-for-word), pain, transformation, CTA, format specs, 3 reference links.",
      "Order 3 UGC videos from Billo or Insense ($150–300 total) using the brief.",
      "Receive deliverables, watch each, score them 1–10 on hook strength.",
      "Take your best 1, cut into 5 variants: same body, different hooks/openers/CTAs (use Capcut, free).",
      "Run a 5-variant test against your current best-performing branded creative for 7 days at consistent budget.",
      "If UGC wins (it usually does), build a process: order 5 new UGC videos every 2 weeks, brief specifically for the highest-performing hook framework you identified in Module 20.",
    ],
    mistakes: [
      "Vague briefs — leads to unusable content.",
      "Picking the prettiest UGC instead of the most stopping — aesthetic ≠ performance.",
      "Running 1 UGC variant against 1 branded variant — sample size too small.",
      "Not iterating winners — finding a winning UGC and never re-cutting it into more variants.",
      "Treating UGC as 'make a video' instead of 'test a hypothesis' — every UGC should test something.",
    ],
    checklist: [
      "I have a 1-page UGC brief template",
      "I've ordered at least 3 UGC videos from a platform",
      "I've taken my best UGC and cut into 5 ad variants",
      "I've tested UGC vs branded creative for 7 days",
      "I have a 2-week cadence for ordering new UGC",
      "I have at least 1 winning UGC concept multiplied into 10+ variants",
    ],
    resources: [
      { label: "Billo — UGC creator platform", url: "https://billo.app/" },
      { label: "Insense — paid creator network", url: "https://insense.pro/" },
      { label: "Trend.io — TikTok-focused UGC", url: "https://trend.io/" },
      { label: "Capcut — free video editor for variant cuts", url: "https://www.capcut.com/" },
      { label: "Loox — for customer-generated UGC", url: "https://loox.io/app/FSL30" },
    ],
  },

  {
    id: 22,
    tier: "growth",
    title: "How to Test Ads Properly (Not Randomly)",
    duration: "~40 min",
    objective:
      "Replace random ad-tweaking with structured experimentation. Run isolated tests with sufficient sample size. Make decisions on data, not vibes.",
    concepts: [
      {
        title: "The ICE prioritization framework",
        body: "From Sean Ellis's Hacking Growth. You'll always have 50 testable ideas. ICE forces you to score each: Impact (1–10) — if it works, how big is the lift? Confidence (1–10) — how sure am I it'll work, based on data/precedent? Ease (1–10) — how fast and cheap to launch? ICE score = average. Run highest scores first. Without ICE, you'll always do the easy stuff (tweaking copy) instead of the high-impact stuff (offer changes, new creators, new audiences).",
      },
      {
        title: "Isolation: change ONE variable",
        body: "Most beginner 'tests' change 3 things at once: new hook, new audience, new landing page. When it wins or loses, you can't tell why. Always isolate one variable. The slower path is the faster path to learning.",
      },
      {
        title: "Sample size requirements",
        body: "From Experimentation Works (Stefan Thomke). Hook rate test: ~5,000 impressions per variant minimum. CTR test: ~3,000 impressions per variant. Conversion test: 100 clicks per variant minimum, ideally 30 conversions per variant for confidence. If you can't afford the impressions/clicks needed, the test won't yield a usable answer. Better to skip than run an underpowered test.",
      },
      {
        title: "The 4 test categories, in order of impact",
        body: "Offer tests (price, bundles, guarantee) — biggest swings, hardest to run. Audience tests (interest sets, broad, lookalikes) — second biggest, easy to run. Creative tests (hook, body, CTA) — third, easy to run, must be isolated. Landing page tests — smallest swings unless your page is bad.",
      },
    ],
    steps: [
      "List 15 testable hypotheses for your business right now. Format: 'If I change X, then Y will improve, because Z.'",
      "ICE-score each (Impact, Confidence, Ease). Sort by score.",
      "Pick your top 3. Pick the one with highest ICE score for this week's test.",
      "Design the test: hypothesis (one sentence), one variable changed, sample size required, budget required, success metric (specific: 'CTR improves by 0.3 percentage points'), duration (minimum 7 days).",
      "Launch. Don't peek before day 7. Don't make changes mid-test.",
      "After day 7, document the result. Win, lose, or no significance — write it down. Build a 'learnings doc' you maintain across all tests.",
    ],
    mistakes: [
      "Calling a test after 2 days because 'it's clearly winning' — you're seeing noise.",
      "Changing 2–3 things at once — unlearnable result.",
      "Running 5 variants on a $100/day budget — too thin per variant for valid data.",
      "Stopping a 'losing' test early without checking sample size — might have been winning by day 7.",
      "Not documenting results — same lessons get re-learned every quarter.",
    ],
    checklist: [
      "I have 15 ICE-scored hypotheses written down",
      "I've designed a test with explicit hypothesis, single variable, and success metric",
      "I've calculated required sample size and budget",
      "I've run my first 7-day isolated test",
      "I have a learnings document where every test outcome is logged",
      "I have a weekly cadence of one new test launched per Monday",
    ],
    resources: [
      { label: "Hacking Growth (Sean Ellis) — ICE framework", url: "https://www.amazon.com/Hacking-Growth-Fastest-Growing-Companies-Breakout/dp/045149721X" },
      { label: "Experimentation Works (Stefan Thomke)", url: "https://www.amazon.com/Experimentation-Works-Surprising-Power-Business/dp/1633697100" },
      { label: "Optimizely sample size calculator", url: "https://www.optimizely.com/sample-size-calculator/" },
    ],
  },

  {
    id: 23,
    tier: "growth",
    title: "Killing, Iterating, or Scaling",
    duration: "~35 min",
    objective:
      "Build a clear decision matrix for every ad: kill, iterate, or scale. Stop holding losers out of optimism and stop scaling early winners that haven't proven repeatability.",
    concepts: [
      {
        title: "The kill/iterate/scale decision matrix",
        body: "Below target + <3 days running → wait. Below target + 3–7 days → iterate (change ONE thing). Below target + 7+ days no improvement → KILL. At target + <7 days → wait. At target + 7+ days → iterate to push higher. Above target + 3–7 days → SCALE 20%. Above target + 7+ days → SCALE 50%+.",
      },
      {
        title: "Ad fatigue: the silent killer",
        body: "Every winning ad eventually fatigues — same audience, same creative = falling CTR, rising CPC. Signals: frequency over 2.5 (Meta) — same person seeing it 2.5+ times. CTR dropping for 3+ consecutive days. CPC rising for 3+ consecutive days. When you see these, it's not the ad's fault — the audience is exhausted. Solution: refresh creative, not target.",
      },
      {
        title: "Iteration vs replacement",
        body: "When iterating a struggling ad, change ONE of: hook (first 3 seconds), body messaging, CTA / endcard, music or pacing, audience or placement. Don't start from scratch unless data clearly says 'this concept is broken.' Most 'killed' ads should have been iterated.",
      },
      {
        title: "The 20% scaling rule",
        body: "When scaling, increase budget by 20% per day, max. Larger jumps reset the algorithm's learning phase, often crashing performance for 3–5 days. Slow + steady wins. The single biggest mistake among self-taught operators is doubling budget on a winner — winning ad becomes a losing ad overnight.",
      },
    ],
    steps: [
      "List every active ad. For each, fill in: days running, current performance vs target, and what the matrix says to do.",
      "Take action on every ad based on the matrix. Kill the chronic losers. Set iteration plans for the marginals.",
      "For each ad you're scaling: schedule a 20%/day budget increase. Set a calendar reminder daily.",
      "Set up a fatigue alarm: daily check on frequency (>2.5) and trailing 3-day CTR (declining). When triggered, queue a refresh creative — don't wait for performance to crash.",
      "For each iteration, isolate the single variable changed. Document hypothesis ('changing the hook from X to Y will increase hook rate by 5pts').",
      "Run a weekly 'kill / iterate / scale' review every Monday. 30 min. Force yourself to make decisions.",
    ],
    mistakes: [
      "Holding losers because 'it might come back' — opportunity cost is real.",
      "Scaling too aggressively (>20%/day) — kills the algorithm's learning phase.",
      "Refreshing creative on a winner before fatigue signals — kills momentum.",
      "Iterating losers infinitely instead of admitting the concept is wrong and restarting.",
      "Not running the Monday review — without forcing the decision, you'll drift.",
    ],
    checklist: [
      "Every active ad has a kill/iterate/scale verdict",
      "Chronic losers (7+ days under target) have been killed",
      "Scaling ads are on a 20%/day increase schedule",
      "Fatigue alarms set (frequency >2.5, CTR decline)",
      "Each iteration is isolated to ONE variable",
      "Monday weekly review is on the calendar",
    ],
    resources: [
      { label: "Hacking Growth (Sean Ellis) — accelerating winners", url: "https://www.amazon.com/Hacking-Growth-Fastest-Growing-Companies-Breakout/dp/045149721X" },
      { label: "Foreplay — track creative fatigue", url: "https://www.foreplay.co/" },
      { label: "Motion App — automated fatigue detection", url: "https://motionapp.com/" },
    ],
  },

  {
    id: 24,
    tier: "growth",
    title: "Scaling Without Destroying ROAS",
    duration: "~50 min",
    objective:
      "Design and execute a 30-day scaling plan that grows daily ad spend 3–5x without crashing ROAS. Build the operational machine that turns a small winning ad into a real business.",
    concepts: [
      {
        title: "Vertical vs horizontal scaling",
        body: "Vertical = same campaign, more budget. Easier, faster, but caps out. Horizontal = duplicate the winning campaign, target different audiences/placements/creatives. Harder, slower, but uncapped. The mistake is treating these as the same thing. You start vertical (push the winning campaign), then go horizontal (replicate the success across new vectors).",
      },
      {
        title: "Why 20% is the magic number for vertical scaling",
        body: "Meta and TikTok algorithms re-enter 'learning phase' if budget changes more than ~20% per day. Learning phase = unstable performance for 3–5 days. Repeated learning phases = perpetual instability = collapsed ROAS. The 20%/day cap is empirically derived from thousands of operators who've broken winning ads by ignoring it.",
      },
      {
        title: "Horizontal scaling vectors",
        body: "New audiences (broaden interest sets, lookalikes, broad targeting). New placements (Stories, Reels, TikTok, Pinterest, YouTube Shorts). New creatives (variant cuts of the winner from Module 21). New geos (US → CA → AU → UK). New offer angles (same product, different positioning — gift, self-care, performance). Each vector can ~match your initial winner's volume; combined, they're 3–10x the original.",
      },
      {
        title: "The retention layer (LTV multiplier)",
        body: "As you scale acquisition, every customer must go into a retention machine: welcome flow (3–5 emails), abandoned cart (3 emails), post-purchase (4–6 emails), winback flow. A store with no email/SMS post-purchase loses 40–60% of potential LTV. Adding the retention layer typically increases per-customer revenue 30–80% within 90 days — without spending more on ads.",
      },
      {
        title: "Kill triggers for scale",
        body: "Before you scale, define the conditions under which you'll un-scale: blended ROAS drops below X for 3 days → reduce budget 30%. CPA rises above Y for 5 days → pause new creatives. Refund rate spikes above Z% → pause scaling, audit fulfillment. Without kill triggers, you'll watch ROAS slide for 2 weeks before reacting.",
      },
    ],
    steps: [
      "Build your 30-day scaling plan. Days 1–7: vertical scale, 20%/day. Target: 2x current daily spend. Days 8–14: horizontal — duplicate winner with new audience. Days 15–21: horizontal — new placement (TikTok if on Meta, vice versa). Days 22–30: scale winners from days 8–21 vertically (still 20%/day cap).",
      "Define your kill triggers in writing: blended ROAS floor, CPA ceiling, refund rate ceiling.",
      "Build the retention layer if you don't have one: Klaviyo (or Omnisend) account; welcome flow (3 emails over 5 days); abandoned cart (3 emails: 1hr, 24hr, 72hr); post-purchase (4 emails over 21 days); winback (1 email at 30d, 1 at 60d).",
      "Set up your scale dashboard: daily spend tracker, daily revenue, blended ROAS, kill-trigger status.",
      "Hire or contract help if needed at >$2k/day spend: media buyer, customer support, fulfillment ops. Scaling alone past this point usually breaks the operator.",
      "Review weekly. If kill triggers fire, reduce. If they don't, continue the 30-day plan.",
    ],
    mistakes: [
      "Scaling >20%/day 'just to test' — you'll trigger the algorithm reset; weeks lost.",
      "Skipping horizontal — vertical alone caps at 2–3x your original winner's volume.",
      "Not defining kill triggers in advance — you'll second-guess in real time and lose money.",
      "Scaling without retention — paying full ad cost for every dollar of LTV.",
      "Trying to scale + manage operations + manage CS solo past $2k/day — burnout breaks the business.",
      "Treating scaling as a one-time event — it's continuous; markets and creatives shift weekly.",
    ],
    checklist: [
      "I have a written 30-day scaling plan with daily spend targets",
      "Kill triggers defined and posted (blended ROAS, CPA, refund rate)",
      "Email retention flows live (welcome, cart, post-purchase, winback)",
      "Scale dashboard tracking blended ROAS daily",
      "At least 2 horizontal scaling vectors prepared (new audience, new placement)",
      "If scaling past $2k/day: contractor or VA arrangements in place",
    ],
    resources: [
      { label: "Hacking Growth (Sean Ellis) — scaling experiments", url: "https://www.amazon.com/Hacking-Growth-Fastest-Growing-Companies-Breakout/dp/045149721X" },
      { label: "Ecommerce Evolved (Tanner Larsson)", url: "https://www.amazon.com/Ecommerce-Evolved-Essential-Playbook-Customers/dp/1535258543" },
      { label: "Klaviyo — email retention", url: "https://www.klaviyo.com" },
      { label: "Triple Whale — required at scale for blended ROAS", url: "https://www.triplewhale.com" },
      { label: "Crossing the Chasm (Geoffrey Moore) — audience expansion", url: "https://www.amazon.com/Crossing-Chasm-3rd-Disruptive-Mainstream/dp/0062292986" },
    ],
  },
];

export function getModule(id: number): Module | undefined {
  return modules.find((m) => m.id === id);
}
