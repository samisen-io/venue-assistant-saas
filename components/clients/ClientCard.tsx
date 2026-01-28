import Link from "next/link"
import { Bell, BellOff, Calendar, Edit, Eye, Mail, Phone, Building2 } from "lucide-react"
import { Client } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

interface ClientCardProps {
    client: Client & { event_count?: number }
}

export function ClientCard({ client }: ClientCardProps) {
    const displayName = client.company_name || client.contact_name
    const subtitle = client.company_name ? client.contact_name : null

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <Link href={`/clients/${client.id}`} className="block">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl hover:text-blue-600 transition-colors">
                                {displayName}
                            </CardTitle>
                            {subtitle && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Building2 className="h-4 w-4" />
                                    <span>{subtitle}</span>
                                </div>
                            )}
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {client.event_count || 0} event{client.event_count === 1 ? "" : "s"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pb-3 text-sm space-y-3">
                    <div className="space-y-2">
                        {client.email && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span className="truncate">{client.email}</span>
                            </div>
                        )}
                        {client.phone && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{client.phone}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        {client.notify_on_booking_updates ? (
                            <span className="inline-flex items-center gap-2 text-green-700">
                                <Bell className="h-4 w-4" />
                                Receives updates
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2 text-gray-500">
                                <BellOff className="h-4 w-4" />
                                Notifications off
                            </span>
                        )}
                    </div>
                </CardContent>
            </Link>
            <CardFooter className="bg-gray-50/50 flex gap-2 pt-3">
                <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/clients/${client.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                    </Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="flex-1">
                    <Link href={`/clients/${client.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
