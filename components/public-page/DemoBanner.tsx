import { DEMO_BANNER_HEADLINE } from "@/lib/public-page/demo"

/**
 * Shown on public venue pages that belong to a demo / unclaimed workspace, so a
 * visitor (recruiter, prospect, or anyone who found the page through a link)
 * never mistakes sample data for a real business.
 */
export function DemoBanner({ venueName }: { venueName?: string | null }) {
  const caseStudyUrl = process.env.NEXT_PUBLIC_CASE_STUDY_URL || "https://prashant-anand.github.io/"

  return (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-900">
      <span className="font-semibold">{DEMO_BANNER_HEADLINE}.</span>{" "}
      {venueName ? `"${venueName}" is` : "This page is"} a sample venue in a demonstration
      workspace — it is not a real business and the contact details are placeholders. Built by{" "}
      <a
        href={caseStudyUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="underline underline-offset-2 hover:text-amber-950"
      >
        Prashant Anand
      </a>
      .
    </div>
  )
}
