"use client";

import { useEffect, useState } from "react";
import { User, Shield, Bell, CreditCard, Calendar, Users, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/lib/types";
import { Loading } from "@/components/shared/Loading";
import { useVenueContext } from "@/lib/context/VenueContext";

interface NotificationPrefs {
    emailEnabled: boolean;
    frequency: "immediate" | "daily" | "off";
    priorityFilter: "all" | "high_only";
    includeTranscript: boolean;
}

export default function SettingsPage() {
    const { toast } = useToast();
    const { activeVenue } = useVenueContext();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
        emailEnabled: true,
        frequency: "immediate",
        priorityFilter: "all",
        includeTranscript: true,
    });

    // Load notification preferences from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem("notificationPrefs");
            if (stored) {
                setNotifPrefs(JSON.parse(stored));
            }
        } catch {
            // ignore parse errors
        }
    }, []);

    const updateNotifPref = <K extends keyof NotificationPrefs>(
        key: K,
        value: NotificationPrefs[K]
    ) => {
        setNotifPrefs((prev) => {
            const updated = { ...prev, [key]: value };
            localStorage.setItem("notificationPrefs", JSON.stringify(updated));
            return updated;
        });
        toast({ title: "Saved", description: "Notification preference updated." });
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/profile");
                if (res.ok) {
                    setProfile(await res.json());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setIsSaving(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile)
            });
            if (res.ok) {
                toast({ title: "Profile Updated", description: "Your changes have been saved." });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <Loading />;

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account and venue preferences.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>Update your profile details and contact information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        value={profile?.full_name || ""}
                                        onChange={(e) => setProfile(p => p ? { ...p, full_name: e.target.value } : null)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" value={profile?.email || ""} disabled className="bg-gray-50" />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company Name</Label>
                                    <Input
                                        id="company"
                                        value={profile?.company_name || ""}
                                        onChange={(e) => setProfile(p => p ? { ...p, company_name: e.target.value } : null)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={profile?.phone || ""}
                                        onChange={(e) => setProfile(p => p ? { ...p, phone: e.target.value } : null)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Save Profile"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security
                        </CardTitle>
                        <CardDescription>Manage your password and security settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Password</p>
                                <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                            </div>
                            <Button variant="outline">Update Password</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Two-Factor Authentication</p>
                                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                            </div>
                            <Button variant="outline">Enable</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Billing & Subscription
                        </CardTitle>
                        <CardDescription>Manage your subscription plan and billing details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Subscription</p>
                                <p className="text-sm text-muted-foreground">View and manage your plan, usage, and payment method</p>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href="/settings/subscription">Manage</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Team Management
                        </CardTitle>
                        <CardDescription>Manage who has access to your venue and their permissions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Team Members</p>
                                <p className="text-sm text-muted-foreground">Invite staff and assign roles to your venue team</p>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href="/settings/team">Manage Team</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Audit Trail
                        </CardTitle>
                        <CardDescription>View a chronological log of all actions taken in your venue.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Activity Logs</p>
                                <p className="text-sm text-muted-foreground">Track changes made by team members and the AI Agent</p>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href="/settings/audit">View Logs</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Calendar Sync
                        </CardTitle>
                        <CardDescription>Sync your venue events to external calendars like Google Calendar or Apple Calendar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activeVenue ? (
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/venues/${activeVenue.id}/calendar.ics`} />
                                <Button className="w-full sm:w-auto" variant="outline" onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/api/venues/${activeVenue.id}/calendar.ics`);
                                    toast({ title: "Copied!", description: "Calendar URL copied to clipboard" });
                                }}>
                                    Copy Link
                                </Button>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Select a venue to sync its calendar.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Choose how you want to be notified about new leads and events.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-sm text-muted-foreground">Receive email alerts for new leads</p>
                            </div>
                            <Switch
                                checked={notifPrefs.emailEnabled}
                                onCheckedChange={(checked) => updateNotifPref("emailEnabled", checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <Label htmlFor="frequency" className="font-medium">Email Frequency</Label>
                                <p className="text-sm text-muted-foreground">How often to receive notifications</p>
                            </div>
                            <Select
                                value={notifPrefs.frequency}
                                onValueChange={(value) => updateNotifPref("frequency", value as NotificationPrefs["frequency"])}
                                disabled={!notifPrefs.emailEnabled}
                            >
                                <SelectTrigger className="w-[160px]" id="frequency">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="immediate">Immediate</SelectItem>
                                    <SelectItem value="daily">Daily Digest</SelectItem>
                                    <SelectItem value="off">Off</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <Label htmlFor="priorityFilter" className="font-medium">Lead Priority Filter</Label>
                                <p className="text-sm text-muted-foreground">Which leads trigger notifications</p>
                            </div>
                            <Select
                                value={notifPrefs.priorityFilter}
                                onValueChange={(value) => updateNotifPref("priorityFilter", value as NotificationPrefs["priorityFilter"])}
                                disabled={!notifPrefs.emailEnabled}
                            >
                                <SelectTrigger className="w-[200px]" id="priorityFilter">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Leads</SelectItem>
                                    <SelectItem value="high_only">High Priority Only (&gt;70)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Include Conversation Transcript</p>
                                <p className="text-sm text-muted-foreground">Attach AI chat transcript in notification emails</p>
                            </div>
                            <Switch
                                checked={notifPrefs.includeTranscript}
                                onCheckedChange={(checked) => updateNotifPref("includeTranscript", checked)}
                                disabled={!notifPrefs.emailEnabled}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
