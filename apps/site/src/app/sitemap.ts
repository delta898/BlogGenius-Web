import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const baseUrl = "https://www.bloggenius.kr";

const routes = [
  "/",
  "/features/",
  "/download/",
  "/guides/",
  "/changelog/",
  "/support/",
  "/privacy-policy/",
  "/terms/",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-09-20");
  return routes.map((route) => ({
    url: `${baseUrl}${route === "/" ? "" : route}`,
    lastModified,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
