import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.SITE_URL?.replace(/\/$/, "");
  if (!baseUrl) return [];

  const routes = ["", "/leistungen", "/ablauf", "/faq", "/kontakt", "/fuhrpark-check", "/agb", "/impressum", "/datenschutz"];
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "yearly",
    priority: route === "" ? 1 : 0.5,
  }));
}
