"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Package = {
  id: string
  name: string
  description: string | null
  base_price: number
  pricing_model: string | null
  inclusions: unknown
}

interface PricingPackagesProps {
  packages: Package[]
  aiShowPricing?: boolean
}

export function PricingPackages({ packages, aiShowPricing = true }: PricingPackagesProps) {
  if (!aiShowPricing) {
    return (
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Pricing</h2>
        <p className="text-muted-foreground">Contact for pricing details.</p>
      </section>
    )
  }

  if (packages.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Pricing</h2>
        <p className="text-muted-foreground">Contact for pricing details.</p>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Packages</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id}>
            <CardHeader className="space-y-2">
              <CardTitle>{pkg.name}</CardTitle>
              <Badge variant="outline">{pkg.pricing_model || "flat"}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-2xl font-bold">${Number(pkg.base_price).toLocaleString()}</p>
              {pkg.description && <p className="text-sm text-muted-foreground">{pkg.description}</p>}
              {Array.isArray(pkg.inclusions) && pkg.inclusions.length > 0 ? (
                <ul className="list-inside list-disc text-sm text-muted-foreground">
                  {pkg.inclusions.slice(0, 4).map((item, idx) => (
                    <li key={`${pkg.id}-inc-${idx}`}>{String(item)}</li>
                  ))}
                </ul>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
