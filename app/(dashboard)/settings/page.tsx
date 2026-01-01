"use client";

import { useEffect, useState } from "react";
import { User, Shield, Bell, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/lib/types";
import { Loading } from "@/components/shared/Loading";

export default function SettingsPage() {
    const { toast } = useToast();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

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
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Choose how you want to be notified about event updates.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center py-8">
                        <p className="text-muted-foreground italic">Notification preferences coming soon.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
