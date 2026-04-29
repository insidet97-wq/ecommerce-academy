import type { IconName } from "@/components/Icon";

export type Resource = {
  id: string;
  category: string;
  name: string;
  description: string;
  url: string;
  icon: IconName;
  free: boolean;
  freeTier?: string; // e.g. "Free up to 250 contacts"
};

export const CATEGORIES = [
  "All",
  "Product Research",
  "Store Building",
  "Sourcing",
  "Marketing & Ads",
  "Email Marketing",
  "Analytics",
  "Creative Tools",
  "Learning",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const resources: Resource[] = [
  /* ── Product Research ── */
  {
    id: "google-trends",
    category: "Product Research",
    name: "Google Trends",
    description: "Check if demand for a product is growing, shrinking or seasonal. Free, no signup required.",
    url: "https://trends.google.com",
    icon: "trending-up",
    free: true,
  },
  {
    id: "tiktok-creative-center",
    category: "Product Research",
    name: "TikTok Creative Center",
    description: "See trending ads, products and sounds directly from TikTok. Best free tool for spotting winners early.",
    url: "https://ads.tiktok.com/business/creativecenter",
    icon: "music",
    free: true,
  },
  {
    id: "meta-ad-library",
    category: "Product Research",
    name: "Meta Ad Library",
    description: "Search every ad running on Facebook and Instagram right now. See what competitors are running and for how long.",
    url: "https://www.facebook.com/ads/library",
    icon: "search",
    free: true,
  },
  {
    id: "aliexpress-dropshipping-center",
    category: "Product Research",
    name: "AliExpress DS Center",
    description: "AliExpress's own tool to find trending products, analyse demand and estimate shipping times. Free with an account.",
    url: "https://home.aliexpress.com/dropshippercenter/product_analysis.htm",
    icon: "shopping-bag",
    free: true,
  },
  {
    id: "exploding-topics",
    category: "Product Research",
    name: "Exploding Topics",
    description: "Discover niches and products that are growing fast before they hit mainstream. Free tier available.",
    url: "https://explodingtopics.com",
    icon: "rocket",
    free: false,
    freeTier: "Limited free searches",
  },
  {
    id: "minea",
    category: "Product Research",
    name: "Minea",
    description: "Spy on winning products from Facebook, TikTok and Pinterest ads. One of the most comprehensive paid spy tools.",
    url: "https://minea.com",
    icon: "scan-search",
    free: false,
  },

  /* ── Store Building ── */
  {
    id: "shopify",
    category: "Store Building",
    name: "Shopify",
    description: "The industry standard platform for ecommerce stores. Handles everything from products to checkout to shipping.",
    url: "https://shopify.com",
    icon: "cart",
    free: false,
    freeTier: "3-day free trial",
  },
  {
    id: "pagefly",
    category: "Store Building",
    name: "PageFly",
    description: "Drag-and-drop landing page builder for Shopify. Build high-converting product pages without touching code.",
    url: "https://pagefly.io",
    icon: "palette",
    free: false,
    freeTier: "1 free page",
  },
  {
    id: "vitals",
    category: "Store Building",
    name: "Vitals",
    description: "40+ conversion-boosting apps in one: reviews, upsells, trust badges, urgency timers and more.",
    url: "https://vitals.co",
    icon: "zap",
    free: false,
    freeTier: "30-day free trial",
  },
  {
    id: "loox",
    category: "Store Building",
    name: "Loox",
    description: "Photo and video review app for Shopify. Import reviews, display them beautifully and boost trust instantly.",
    url: "https://loox.io/app/FSL30",
    icon: "star",
    free: false,
    freeTier: "14-day free trial",
  },

  /* ── Sourcing ── */
  {
    id: "aliexpress",
    category: "Sourcing",
    name: "AliExpress",
    description: "The most beginner-friendly way to find and order products. Thousands of suppliers, low minimum orders, worldwide shipping.",
    url: "https://aliexpress.com",
    icon: "package",
    free: true,
  },
  {
    id: "cj-dropshipping",
    category: "Sourcing",
    name: "CJ Dropshipping",
    description: "Free dropshipping agent with warehouses in China and the US. Faster shipping and better margins than AliExpress.",
    url: "https://cjdropshipping.com",
    icon: "factory",
    free: true,
  },
  {
    id: "zendrop",
    category: "Sourcing",
    name: "Zendrop",
    description: "US-based dropshipping fulfillment with fast shipping times. Popular for scaling once you find a winner.",
    url: "https://zendrop.com",
    icon: "truck",
    free: false,
    freeTier: "Free plan (50 orders/month)",
  },
  {
    id: "spocket",
    category: "Sourcing",
    name: "Spocket",
    description: "Source products from EU and US suppliers for faster 2–7 day delivery. Great for European sellers.",
    url: "https://spocket.co",
    icon: "globe",
    free: false,
    freeTier: "Free browsing",
  },

  /* ── Marketing & Ads ── */
  {
    id: "meta-ads-manager",
    category: "Marketing & Ads",
    name: "Meta Ads Manager",
    description: "Run ads on Facebook and Instagram. The most powerful targeting platform for ecommerce. Start with $5–10/day.",
    url: "https://adsmanager.facebook.com",
    icon: "megaphone",
    free: true,
  },
  {
    id: "tiktok-ads-manager",
    category: "Marketing & Ads",
    name: "TikTok Ads Manager",
    description: "Run paid ads on TikTok. Lower CPMs than Meta right now and excellent for impulse-buy products.",
    url: "https://ads.tiktok.com",
    icon: "smartphone",
    free: true,
  },
  {
    id: "adspy",
    category: "Marketing & Ads",
    name: "AdSpy",
    description: "The largest database of Facebook and Instagram ads. Find your competitors, see what's working and model it.",
    url: "https://adspy.com",
    icon: "eye",
    free: false,
  },

  /* ── Email Marketing ── */
  {
    id: "klaviyo",
    category: "Email Marketing",
    name: "Klaviyo",
    description: "The go-to email platform for ecommerce. Deep Shopify integration, powerful flows (abandoned cart, welcome, etc.).",
    url: "https://klaviyo.com",
    icon: "mail",
    free: false,
    freeTier: "Free up to 250 contacts",
  },
  {
    id: "omnisend",
    category: "Email Marketing",
    name: "Omnisend",
    description: "Email + SMS marketing built for ecommerce. Slightly more generous free tier than Klaviyo.",
    url: "https://omnisend.com",
    icon: "send",
    free: false,
    freeTier: "Free up to 250 contacts / 500 emails/month",
  },
  {
    id: "privy",
    category: "Email Marketing",
    name: "Privy",
    description: "The simplest popup and email capture builder for Shopify. Exit-intent, spin-to-win, embedded forms — turn store visitors into subscribers without writing code.",
    url: "https://go.privy.com/NYUtfS6",
    icon: "target",
    free: false,
    freeTier: "Free up to 100 contacts",
  },

  /* ── Analytics ── */
  {
    id: "google-analytics",
    category: "Analytics",
    name: "Google Analytics 4",
    description: "Free traffic analytics. See where visitors come from, what pages they visit and where they drop off.",
    url: "https://analytics.google.com",
    icon: "bar-chart",
    free: true,
  },
  {
    id: "hotjar",
    category: "Analytics",
    name: "Hotjar",
    description: "Heatmaps, session recordings and surveys. See exactly where visitors click, scroll and leave your store.",
    url: "https://hotjar.com",
    icon: "flame",
    free: false,
    freeTier: "Free up to 35 sessions/day",
  },
  {
    id: "triple-whale",
    category: "Analytics",
    name: "Triple Whale",
    description: "Advanced ecommerce analytics dashboard. Tracks your real ROAS across all channels in one place. For scaling stores.",
    url: "https://triplewhale.com",
    icon: "line-chart",
    free: false,
  },

  /* ── Creative Tools ── */
  {
    id: "canva",
    category: "Creative Tools",
    name: "Canva",
    description: "Design ad creatives, product images and store graphics without any design experience. Free tier is very powerful.",
    url: "https://canva.com",
    icon: "palette",
    free: false,
    freeTier: "Generous free plan",
  },
  {
    id: "capcut",
    category: "Creative Tools",
    name: "CapCut",
    description: "Free video editor used by most TikTok sellers. Fast cuts, captions, trending effects — perfect for product videos.",
    url: "https://capcut.com",
    icon: "film",
    free: true,
  },
  {
    id: "remove-bg",
    category: "Creative Tools",
    name: "Remove.bg",
    description: "Remove image backgrounds in one click. Useful for clean product photos and ad creatives.",
    url: "https://remove.bg",
    icon: "edit",
    free: false,
    freeTier: "5 free previews",
  },

  /* ── Learning ── */
  {
    id: "shopify-learn",
    category: "Learning",
    name: "Shopify Learn",
    description: "Free official Shopify courses covering everything from launching a store to running ads. Great supplementary material.",
    url: "https://learn.shopify.com",
    icon: "book-open",
    free: true,
  },
  {
    id: "youtube-davie",
    category: "Learning",
    name: "Davie Fogarty — YouTube",
    description: "Built a $300M/year brand from his bedroom. His YouTube channel is the most honest, no-fluff ecommerce education available.",
    url: "https://www.youtube.com/@DavieFogarty",
    icon: "film",
    free: true,
  },
  {
    id: "youtube-jordan",
    category: "Learning",
    name: "Jordan Welch — YouTube",
    description: "Practical, honest breakdowns of what's working in ecommerce right now. Great for beginners learning the ad side.",
    url: "https://www.youtube.com/@JordanWelch",
    icon: "film",
    free: true,
  },
  {
    id: "reddit-dropship",
    category: "Learning",
    name: "r/dropship",
    description: "The largest ecommerce community on Reddit. Real people sharing wins, losses, and honest advice. No gurus.",
    url: "https://reddit.com/r/dropship",
    icon: "message",
    free: true,
  },
];
