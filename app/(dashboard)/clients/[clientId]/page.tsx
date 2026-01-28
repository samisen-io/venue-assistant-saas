"use client";

import { useParams } from "next/navigation";
import { ClientDetail } from "@/components/clients/ClientDetail";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

export default function ClientDetailPage() {
    const params = useParams();
    const clientId = params?.clientId as string;

    if (!clientId) return null;

    return (
        <div className="space-y-4">
            <Breadcrumbs items={[{ label: "Clients", href: "/clients" }, { label: "Client Details" }]} />
            <ClientDetail clientId={clientId} />
        </div>
    );
}
