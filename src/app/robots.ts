import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/leistungen", "/ablauf", "/faq", "/kontakt", "/fuhrpark-check", "/agb", "/impressum", "/datenschutz", "/danke", "/kundenlogin"],
      disallow: [
        "/api/",
        "/admin",
        "/admin/",
        "/dashboard",
        "/dashboard/",
        "/operations",
        "/operations/",
        "/login",
        "/kundenportal",
        "/kundenportal/",
      ],
    },
    ...(process.env.SITE_URL ? { sitemap: `${process.env.SITE_URL.replace(/\/$/, "")}/sitemap.xml` } : {}),
  };
}
