import Link from "next/link";
import { Bell, BellOff, Eye, Edit } from "lucide-react";
import { Client } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ClientTableProps {
    clients: (Client & { event_count?: number })[];
}

export function ClientTable({ clients }: ClientTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-right">Events</TableHead>
                        <TableHead>Notifications</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.map((client) => (
                        <TableRow key={client.id}>
                            <TableCell className="font-medium">
                                <Link href={`/clients/${client.id}`} className="hover:text-blue-600 hover:underline">
                                    {client.contact_name || client.company_name}
                                </Link>
                            </TableCell>
                            <TableCell>{client.company_name || "—"}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{client.email || "—"}</TableCell>
                            <TableCell>{client.phone || "—"}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant="secondary">
                                    {client.event_count || 0}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {client.notify_on_booking_updates ? (
                                    <Bell className="h-4 w-4 text-green-600" />
                                ) : (
                                    <BellOff className="h-4 w-4 text-gray-400" />
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={`/clients/${client.id}`}>
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={`/clients/${client.id}/edit`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
