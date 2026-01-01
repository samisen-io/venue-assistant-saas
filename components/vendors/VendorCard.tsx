import Link from "next/link";
import { Edit, ExternalLink, Mail, Phone, Star, Eye } from "lucide-react";
import { Vendor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";

interface VendorCardProps {
    vendor: Vendor;
}

export function VendorCard({ vendor }: VendorCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <Link href={`/vendors/${vendor.id}`} className="block">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl hover:text-blue-600 transition-colors">{vendor.name}</CardTitle>
                            <Badge variant="secondary" className="capitalize">
                                {vendor.category}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded text-yellow-700 font-medium text-sm border border-yellow-100">
                            <Star className="h-4 w-4 fill-current" />
                            <span>{vendor.reliability_score || "N/A"}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pb-3 text-sm space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Contact</p>
                            <p className="truncate font-medium">{vendor.contact_name || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Starting Price</p>
                            <p className="font-medium">{vendor.cost_per_unit ? formatCurrency(vendor.cost_per_unit) : "Contact for Quote"}</p>
                        </div>
                    </div>

                    <div className="space-y-2 border-t pt-3">
                        {vendor.contact_email && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span className="truncate">{vendor.contact_email}</span>
                            </div>
                        )}
                        {vendor.contact_phone && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{vendor.contact_phone}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Link>
            <CardFooter className="bg-gray-50/50 flex gap-2 pt-3">
                <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/vendors/${vendor.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                    </Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="flex-1">
                    <Link href={`/vendors/${vendor.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
