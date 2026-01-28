"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronsUpDown, UserPlus } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { Client } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientSelectorProps {
    selectedClientId?: string | null;
    onSelect: (clientId: string | null) => void;
    disabled?: boolean;
}

export function ClientSelector({ selectedClientId, onSelect, disabled = false }: ClientSelectorProps) {
    const { clients, loading } = useClients();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const selectedClient = clients.find((client) => client.id === selectedClientId) as Client | undefined;

    const filteredClients = useMemo(() => {
        if (!search) return clients;
        const lower = search.toLowerCase();
        return clients.filter((client) => {
            return (
                client.contact_name?.toLowerCase().includes(lower) ||
                client.company_name?.toLowerCase().includes(lower) ||
                client.email?.toLowerCase().includes(lower)
            );
        });
    }, [clients, search]);

    if (loading) {
        return <Skeleton className="h-10 w-full" />;
    }

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                        disabled={disabled}
                    >
                        {selectedClient ? (
                            <span>
                                {selectedClient.company_name
                                    ? `${selectedClient.company_name} - ${selectedClient.contact_name}`
                                    : selectedClient.contact_name}
                            </span>
                        ) : (
                            <span className="text-muted-foreground">Select a client (optional)</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-2" align="start">
                    <Input
                        placeholder="Search clients..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="mt-2 max-h-60 overflow-auto">
                        <button
                            type="button"
                            className={cn(
                                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted",
                                !selectedClientId && "bg-muted"
                            )}
                            onClick={() => {
                                onSelect(null);
                                setOpen(false);
                            }}
                        >
                            <Check className={cn("h-4 w-4", selectedClientId ? "opacity-0" : "opacity-100")} />
                            No client
                        </button>
                        {filteredClients.map((client) => (
                            <button
                                key={client.id}
                                type="button"
                                className={cn(
                                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted",
                                    client.id === selectedClientId && "bg-muted"
                                )}
                                onClick={() => {
                                    onSelect(client.id);
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "h-4 w-4",
                                        client.id === selectedClientId ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <div className="text-left">
                                    <p className="font-medium">
                                        {client.company_name || client.contact_name}
                                    </p>
                                    {client.company_name && (
                                        <p className="text-xs text-muted-foreground">{client.contact_name}</p>
                                    )}
                                </div>
                            </button>
                        ))}
                        {filteredClients.length === 0 && (
                            <div className="px-3 py-2 text-sm text-muted-foreground">No clients found.</div>
                        )}
                    </div>
                    <div className="mt-3 border-t pt-3">
                        <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                            <Link href="/clients/new">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Create New Client
                            </Link>
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
