import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/leistungen", "/ablauf", "/faq", "/kontakt", "/fuhrpark-check", "/agb", "/impressum", "/datenschutz"],
      disallow: ["/api/"],
    },
    ...(process.env.SITE_URL ? { sitemap: `${process.env.SITE_URL.replace(/\/$/, "")}/sitemap.xml` } : {}),
  };
}
