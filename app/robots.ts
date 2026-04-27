import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/quiz", "/login", "/signup", "/privacy", "/terms", "/niche-picker", "/blog"],
        disallow: ["/dashboard", "/admin", "/pro", "/modules", "/api", "/certificate"],
      },
    ],
    sitemap: "https://firstsalelab.com/sitemap.xml",
  };
}
