"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, UserPlus, MessageSquare, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface Notification {
    id: string;
    type: "new_lead" | "lead_status" | "new_conversation" | "proposal_viewed";
    title: string;
    description: string;
    read: boolean;
    created_at: string;
    link?: string;
}

function timeAgo(dateStr: string): string {
    const seconds = Math.floor(
        (Date.now() - new Date(dateStr).getTime()) / 1000
    );
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

function getNotificationIcon(type: Notification["type"]) {
    switch (type) {
        case "new_lead":
            return <UserPlus className="h-4 w-4 text-green-600" />;
        case "lead_status":
            return <UserPlus className="h-4 w-4 text-blue-600" />;
        case "new_conversation":
            return <MessageSquare className="h-4 w-4 text-purple-600" />;
        case "proposal_viewed":
            return <FileText className="h-4 w-4 text-amber-600" />;
        default:
            return <Bell className="h-4 w-4 text-gray-600" />;
    }
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setNotifications(data);
                }
            }
        } catch {
            // Silently fail - notifications are non-critical
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every 60s
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleMarkAllRead = async () => {
        const unreadIds = notifications
            .filter((n) => !n.read)
            .map((n) => n.id);
        if (unreadIds.length === 0) return;

        try {
            await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: unreadIds }),
            });
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
            );
        } catch {
            // Silently fail
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[420px] overflow-y-auto">
                <div className="flex items-center justify-between px-3 py-2">
                    <p className="text-sm font-semibold">Notifications</p>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-primary hover:underline"
                        >
                            Mark all read
                        </button>
                    )}
                </div>
                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                    <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                        No notifications yet
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <Link
                            key={notification.id}
                            href={notification.link || "/leads"}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors ${
                                !notification.read ? "bg-blue-50/50" : ""
                            }`}
                        >
                            <div className="mt-0.5 flex-shrink-0">
                                {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p
                                    className={`text-sm truncate ${
                                        !notification.read
                                            ? "font-semibold"
                                            : "font-medium"
                                    }`}
                                >
                                    {notification.title}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {notification.description}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {timeAgo(notification.created_at)}
                                </p>
                            </div>
                            {!notification.read && (
                                <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                            )}
                        </Link>
                    ))
                )}

                <DropdownMenuSeparator />
                <Link
                    href="/leads"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs text-primary hover:underline"
                >
                    View all leads
                    <ExternalLink className="h-3 w-3" />
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
