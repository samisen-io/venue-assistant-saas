import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://venuemanager.pro"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/settings/",
          "/onboarding/",
          "/events/",
          "/vendors/",
          "/clients/",
          "/leads/",
          "/spaces/",
          "/calendar/",
          "/venues/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
