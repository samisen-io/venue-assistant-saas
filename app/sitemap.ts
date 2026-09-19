/* eslint-disable @typescript-eslint/no-explicit-any */
import { MetadataRoute } from "next";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { demoSlugs, isDemoOwner } from "@/lib/public-page/demo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://venuemanager.pro";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Dynamic venue pages
  const venuePages: MetadataRoute.Sitemap = [];

  try {
    const supabase = createServiceRoleClient();
    const { data: venues } = await (supabase as any)
      .from("venues")
      .select("slug, updated_at, owner_id")
      .eq("page_status", "published")
      .not("slug", "is", null);

    // Demo workspaces are showcases, not real listings: keep them out of the
    // sitemap so search engines never surface borrowed sample venues.
    const demoOwnerIds = new Set<string>();
    const { data: profiles } = await (supabase as any)
      .from("profiles")
      .select("id, full_name, company_name");
    if (Array.isArray(profiles)) {
      for (const p of profiles) {
        if (isDemoOwner(p)) demoOwnerIds.add(p.id);
      }
    }
    const demoSlugList = demoSlugs();

    if (venues && Array.isArray(venues)) {
      for (const venue of venues) {
        if (venue.slug && !demoSlugList.includes(venue.slug) && !demoOwnerIds.has(venue.owner_id)) {
          venuePages.push({
            url: `${baseUrl}/${venue.slug}`,
            lastModified: venue.updated_at
              ? new Date(venue.updated_at)
              : new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error fetching venue slugs for sitemap:", error);
  }

  return [...staticPages, ...venuePages];
}
