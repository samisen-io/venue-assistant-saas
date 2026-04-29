"use client";

import { useState, useEffect } from "react";
import { History, Search, Filter, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useVenueContext } from "@/lib/context/VenueContext";
import { Loading } from "@/components/shared/Loading";
import { createClient } from "@/lib/supabase/client";

interface AuditLog {
  id: string;
  action_type: string;
  entity_type: string;
  description: string;
  changes: any;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
  actor_id: string | null;
}

export default function AuditTrailPage() {
  const { activeVenue } = useVenueContext();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();

  const fetchLogs = async () => {
    if (!activeVenue) return;
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from("audit_logs")
      .select(`
        id,
        action_type,
        entity_type,
        description,
        changes,
        created_at,
        actor_id,
        profiles (
          full_name,
          email
        )
      `)
      .eq("venue_id", activeVenue.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setLogs(data as unknown as AuditLog[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [activeVenue]);

  const filteredLogs = logs.filter(log => 
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.profiles?.full_name || "System").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action.includes("delete") || action.includes("remove")) return "destructive";
    if (action.includes("create") || action.includes("book")) return "default";
    if (action.includes("ai_")) return "secondary";
    return "outline";
  };

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Audit Trail</h1>
        <p className="text-muted-foreground mt-1">Track all activities, changes, and AI operations across your venue.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Activity Log
              </CardTitle>
              <CardDescription>The last 50 actions performed in {activeVenue?.name}</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search logs..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <ShieldAlert className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No audit logs found matching your criteria.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-muted ml-3 space-y-8">
                {filteredLogs.map((log) => {
                  const isAiAction = log.action_type.startsWith("ai_") || log.profiles?.full_name === "AI Assistant";
                  
                  return (
                    <div key={log.id} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-background ${isAiAction ? 'bg-blue-500' : 'bg-primary'}`} />
                      
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-sm font-medium">
                            <span className={isAiAction ? "text-blue-600" : ""}>
                              {log.profiles?.full_name || "System"}
                            </span>
                            {" "}
                            <span className="text-muted-foreground font-normal">performed an action on</span>
                            {" "}
                            <span className="capitalize">{log.entity_type}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={getActionColor(log.action_type)}>
                          {log.action_type.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      <div className="bg-muted/40 rounded-md p-3 text-sm">
                        <p>{log.description}</p>
                        
                        {log.changes && Object.keys(log.changes).length > 0 && (
                          <div className="mt-3 text-xs bg-background p-2 rounded border overflow-x-auto">
                            <pre className="text-muted-foreground font-mono">
                              {JSON.stringify(log.changes, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
