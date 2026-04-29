"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useVenueContext } from "@/lib/context/VenueContext";
import { Loading } from "@/components/shared/Loading";

interface TeamMember {
  id: string;
  profile_id: string;
  role: "owner" | "admin" | "staff" | "ai_agent";
  profiles: {
    full_name: string;
    email: string;
  };
}

export default function TeamSettingsPage() {
  const { activeVenue } = useVenueContext();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "staff">("staff");
  const [isInviting, setIsInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const fetchMembers = async () => {
    if (!activeVenue) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/venues/${activeVenue.id}/team`);
      if (res.ok) {
        setMembers(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch team members:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [activeVenue]);

  const handleRemove = async (memberId: string) => {
    if (!activeVenue) return;
    setRemovingId(memberId);
    try {
      const res = await fetch(`/api/venues/${activeVenue.id}/team/${memberId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({ title: "Member Removed", description: "The team member has been removed." });
        await fetchMembers();
      } else {
        const errorText = await res.text();
        toast({ title: "Failed", description: errorText || "Could not remove member.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to connect to server.", variant: "destructive" });
    } finally {
      setRemovingId(null);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVenue || !inviteEmail) return;
    
    setIsInviting(true);
    
    try {
      const res = await fetch(`/api/venues/${activeVenue.id}/team/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (res.ok) {
        const { emailSent } = await res.json();
        toast({
          title: emailSent ? "Invitation Sent" : "Member Added",
          description: emailSent
            ? `An invitation email has been sent to ${inviteEmail}.`
            : `${inviteEmail} already has an account and has been added to the team.`,
        });
        setInviteEmail("");
        // Refresh the list immediately to show the new member
        await fetchMembers();
      } else {
        const errorText = await res.text();
        toast({
          title: "Invitation Failed",
          description: errorText || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to connect to server.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Team Management</h1>
        <p className="text-muted-foreground mt-1">Manage who has access to your venue and their permissions.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Team Member
            </CardTitle>
            <CardDescription>Send an email invitation to add a new member to this venue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1 w-full">
                <label className="text-sm font-medium">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="colleague@example.com" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 w-full sm:w-[200px]">
                <label className="text-sm font-medium">Role</label>
                <Select value={inviteRole} onValueChange={(v: "admin" | "staff") => setInviteRole(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isInviting} className="w-full sm:w-auto">
                {isInviting ? "Sending..." : "Send Invite"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Members
            </CardTitle>
            <CardDescription>People with access to manage {activeVenue?.name}.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No team members found.</p>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                        {member.profiles?.full_name?.charAt(0).toUpperCase() || member.profiles?.email?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {member.profiles?.full_name || "Unknown User"}
                          {member.role === "ai_agent" && <Shield className="h-3 w-3 text-blue-500" />}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm capitalize px-2 py-1 bg-secondary rounded-md">
                        {member.role.replace("_", " ")}
                      </div>
                      {member.role !== "owner" && member.role !== "ai_agent" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={removingId === member.id}
                          onClick={() => handleRemove(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
