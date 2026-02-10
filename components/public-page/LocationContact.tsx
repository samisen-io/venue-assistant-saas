import { Mail, MapPin, Phone } from "lucide-react"

interface LocationContactProps {
  name: string
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  phone?: string | null
  email?: string | null
  latitude?: number | null
  longitude?: number | null
  businessHours?: Record<string, unknown> | null
  socialLinks?: Record<string, string> | null
  privacySettings?: { hide_address?: boolean; hide_phone?: boolean; hide_email?: boolean } | null
}

function formatBusinessHours(hours: Record<string, unknown>): Array<{ day: string; value: string }> {
  const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

  return Object.entries(hours)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
    .sort(([a], [b]) => {
      const ai = dayOrder.indexOf(a.toLowerCase())
      const bi = dayOrder.indexOf(b.toLowerCase())
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })
    .map(([day, value]) => {
      const normalizedDay = day.charAt(0).toUpperCase() + day.slice(1)
      if (typeof value === "string") return { day: normalizedDay, value }
      if (typeof value === "object" && value !== null) {
        const obj = value as Record<string, unknown>
        const open = typeof obj.open === "string" ? obj.open : null
        const close = typeof obj.close === "string" ? obj.close : null
        const closed = obj.closed === true
        if (closed) return { day: normalizedDay, value: "Closed" }
        if (open && close) return { day: normalizedDay, value: `${open} - ${close}` }
      }
      return { day: normalizedDay, value: String(value) }
    })
}

export function LocationContact(props: LocationContactProps) {
  const {
    name,
    address,
    city,
    state,
    zipCode,
    phone,
    email,
    latitude,
    longitude,
    businessHours,
    socialLinks,
    privacySettings,
  } = props

  const hideAddress = privacySettings?.hide_address === true
  const hidePhone = privacySettings?.hide_phone === true
  const hideEmail = privacySettings?.hide_email === true
  const hasVisibleContact = (!hideAddress && (address || city || state)) || (!hidePhone && phone) || (!hideEmail && email)
  if (!hasVisibleContact) return null

  const fullAddress = [address, city, state, zipCode].filter(Boolean).join(", ")
  const mapsQuery = encodeURIComponent(fullAddress || `${latitude},${longitude}`)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`
  const businessHoursRows = businessHours ? formatBusinessHours(businessHours) : []

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Location & Contact</h2>
        {!hideAddress && fullAddress && (
          <p className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4" />
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {fullAddress}
            </a>
          </p>
        )}
        {!hidePhone && phone && (
          <p className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4" />
            <a href={`tel:${phone}`} className="hover:underline">
              {phone}
            </a>
          </p>
        )}
        {!hideEmail && email && (
          <p className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${email}`} className="hover:underline">
              {email}
            </a>
          </p>
        )}
        {businessHoursRows.length > 0 && (
          <div className="rounded border p-3">
            <p className="mb-2 text-sm font-medium">Business Hours</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {businessHoursRows.map((item) => (
                <li key={item.day} className="flex items-center justify-between gap-3">
                  <span className="font-medium text-foreground">{item.day}</span>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {socialLinks && Object.keys(socialLinks).length > 0 && (
          <div className="flex flex-wrap gap-2 text-sm">
            {Object.entries(socialLinks).map(([key, value]) => (
              <a key={key} href={value} target="_blank" rel="noopener noreferrer" className="rounded border px-2 py-1 capitalize hover:bg-muted">
                {key}
              </a>
            ))}
          </div>
        )}
      </div>

      {latitude && longitude ? (
        <div className="overflow-hidden rounded-xl border">
          <iframe
            title={`${name} map`}
            src={`https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
            className="h-[320px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div className="flex h-[320px] items-center justify-center rounded-xl border text-sm text-muted-foreground">
          Map coordinates not configured yet
        </div>
      )}
    </section>
  )
}
