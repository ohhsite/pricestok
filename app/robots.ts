import { siteUrl } from "./lib/config";
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/panel", "/api/", "/dodaj-promocje"],
    },
    sitemap: siteUrl() + "/sitemap.xml",
  };
}
