import Link from "next/link";
import { Star, Eye, Edit } from "lucide-react";
import { Vendor } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface VendorTableProps {
    vendors: Vendor[];
}

export function VendorTable({ vendors }: VendorTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Services</TableHead>
                        <TableHead>Reliability</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vendors.map((vendor) => {
                        const services = (vendor as any).vendor_services || [];
                        return (
                            <TableRow key={vendor.id}>
                                <TableCell className="font-medium">
                                    <Link href={`/vendors/${vendor.id}`} className="hover:text-blue-600 hover:underline">
                                        {vendor.name}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {services.slice(0, 2).map((service: any) => (
                                            <Badge key={service.event_service_id} variant="secondary" className="text-xs">
                                                {service.event_services?.name || "Service"}
                                            </Badge>
                                        ))}
                                        {services.length > 2 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{services.length - 2}
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center gap-1 text-yellow-700">
                                        <Star className="h-3.5 w-3.5 fill-current" />
                                        {vendor.reliability_score || "N/A"}
                                    </span>
                                </TableCell>
                                <TableCell>{vendor.contact_name || "—"}</TableCell>
                                <TableCell className="text-right">
                                    {vendor.cost_per_unit ? formatCurrency(vendor.cost_per_unit) : "—"}
                                </TableCell>
                                <TableCell className="max-w-[180px] truncate">{vendor.contact_email || "—"}</TableCell>
                                <TableCell>{vendor.contact_phone || "—"}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/vendors/${vendor.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/vendors/${vendor.id}/edit`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
