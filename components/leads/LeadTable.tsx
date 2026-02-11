import Link from "next/link";
import { Eye, Calendar, Users } from "lucide-react";
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

/* eslint-disable @typescript-eslint/no-explicit-any */

interface LeadTableProps {
    leads: any[];
}

const STATUS_COLORS: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-purple-100 text-purple-800",
    qualified: "bg-indigo-100 text-indigo-800",
    proposal_sent: "bg-amber-100 text-amber-800",
    negotiating: "bg-orange-100 text-orange-800",
    won: "bg-green-100 text-green-800",
    lost: "bg-red-100 text-red-800",
};

function priorityBadge(score: number) {
    if (score >= 70) return <Badge variant="destructive">High</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
    return <Badge variant="secondary">Low</Badge>;
}

export function LeadTable({ leads }: LeadTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Contact</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Event Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leads.map((lead) => (
                        <TableRow key={lead.id}>
                            <TableCell className="font-medium">
                                <Link href={`/leads/${lead.id}`} className="hover:text-blue-600 hover:underline">
                                    {lead.contact_name || "Unknown Contact"}
                                </Link>
                            </TableCell>
                            <TableCell>{lead.company || "—"}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                                {lead.contact_email || "—"}
                            </TableCell>
                            <TableCell>{lead.contact_phone || "—"}</TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1 text-xs">
                                    {lead.event_type && (
                                        <Badge variant="outline" className="w-fit">
                                            {lead.event_type}
                                        </Badge>
                                    )}
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        {lead.event_date && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {lead.event_date}
                                            </span>
                                        )}
                                        {lead.guest_count && (
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {lead.guest_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span
                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-800"}`}
                                >
                                    {(lead.status ?? "new").replace(/_/g, " ")}
                                </span>
                            </TableCell>
                            <TableCell>{priorityBadge(lead.priority_score ?? 0)}</TableCell>
                            <TableCell className="capitalize">
                                {lead.source?.replace(/_/g, " ") ?? "manual"}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={`/leads/${lead.id}`}>
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
