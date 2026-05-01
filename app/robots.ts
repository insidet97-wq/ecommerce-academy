import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/quiz", "/login", "/signup", "/privacy", "/terms", "/niche-picker", "/blog", "/tools", "/resources", "/about", "/contact"],
        disallow: ["/dashboard", "/admin", "/pro", "/modules", "/api", "/certificate"],
      },
    ],
    sitemap: "https://www.firstsalelab.com/sitemap.xml",
  };
}
