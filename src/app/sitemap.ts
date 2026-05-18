import { MetadataRoute } from "next";
import { DEFAULT_COIN_MAP } from "@/lib/coins";

const BASE_URL = "https://cryptoflowcheck.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date() },
    { url: `${BASE_URL}/markets`, lastModified: new Date() },
    { url: `${BASE_URL}/compare`, lastModified: new Date() },
    { url: `${BASE_URL}/exchanges`, lastModified: new Date() },
    { url: `${BASE_URL}/compare/exchanges`, lastModified: new Date() },
    { url: `${BASE_URL}/heatmap`, lastModified: new Date() },
    { url: `${BASE_URL}/events`, lastModified: new Date() },
    { url: `${BASE_URL}/blog`, lastModified: new Date() },
  ];

  const coinRoutes: MetadataRoute.Sitemap = Object.keys(DEFAULT_COIN_MAP).map((id) => ({
    url: `${BASE_URL}/coin/${id}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...coinRoutes];
}
