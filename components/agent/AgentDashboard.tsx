'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bot, Mail, PlayCircle, Clock, CheckCircle2, XCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { AgentRun, VendorCommunication, Event, Vendor } from '@/lib/types'
import { AgentRunLogs } from './AgentRunLogs'
import { VendorCommunicationList } from './VendorCommunicationList'
import { StartAgentDialog } from './StartAgentDialog'
import { format } from 'date-fns'

interface AgentDashboardProps {
  event: Event
  agentRuns: AgentRun[]
  communications: (VendorCommunication & { vendor?: Vendor })[]
  vendors: Vendor[]
}

export function AgentDashboard({
  event,
  agentRuns,
  communications,
  vendors,
}: AgentDashboardProps) {
  const [selectedRun, setSelectedRun] = useState<AgentRun | null>(
    agentRuns.length > 0 ? agentRuns[0] : null
  )

  const activeRun = agentRuns.find(run => run.status === 'running')
  const hasActiveRun = !!activeRun

  // Calculate statistics
  const stats = selectedRun
    ? {
        targeted: selectedRun.vendors_targeted || 0,
        contacted: selectedRun.vendors_contacted || 0,
        responded: selectedRun.vendors_responded || 0,
        quotes: selectedRun.quotes_received || 0,
      }
    : { targeted: 0, contacted: 0, responded: 0, quotes: 0 }

  const responseRate =
    stats.contacted > 0 ? Math.round((stats.responded / stats.contacted) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendors Targeted</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.targeted}</div>
            <p className="text-xs text-muted-foreground">
              {stats.contacted} contacted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responded}</div>
            <p className="text-xs text-muted-foreground">
              {responseRate}% response rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quotes Received</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.quotes}</div>
            <p className="text-xs text-muted-foreground">
              {stats.responded > 0
                ? Math.round((stats.quotes / stats.responded) * 100)
                : 0}
              % with quotes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasActiveRun ? (
                <Badge variant="default" className="text-sm">
                  Running
                </Badge>
              ) : agentRuns.length > 0 ? (
                <Badge variant="secondary" className="text-sm">
                  Completed
                </Badge>
              ) : (
                <Badge variant="outline" className="text-sm">
                  Not Started
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {agentRuns.length} total runs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {selectedRun && stats.targeted > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={(stats.responded / stats.targeted) * 100} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{stats.responded} of {stats.targeted} vendors responded</span>
              <span>{stats.quotes} quotes received</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="logs">Agent Logs</TabsTrigger>
          </TabsList>

          <StartAgentDialog
            eventId={event.id}
            vendors={vendors}
            hasActiveRun={hasActiveRun}
          />
        </div>

        <TabsContent value="overview" className="space-y-4">
          {/* Agent Runs List */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Runs</CardTitle>
              <CardDescription>
                History of all agent runs for this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agentRuns.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No agent runs yet</p>
                  <p className="text-sm mb-4">
                    Start the AI agent to begin automated vendor outreach
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {agentRuns.map(run => (
                    <div
                      key={run.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedRun?.id === run.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedRun(run)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              Agent Run - {format(new Date(run.started_at!), 'MMM d, yyyy h:mm a')}
                            </h4>
                            {run.status === 'running' && (
                              <Badge variant="default">Running</Badge>
                            )}
                            {run.status === 'completed' && (
                              <Badge variant="secondary">Completed</Badge>
                            )}
                            {run.status === 'failed' && (
                              <Badge variant="destructive">Failed</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {run.vendors_targeted} vendors targeted • {run.vendors_contacted} contacted •{' '}
                            {run.vendors_responded} responded • {run.quotes_received} quotes
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {run.trigger_type === 'manual' ? 'Manual' : 'Automated'}
                        </div>
                      </div>

                      {run.last_error_message && (
                        <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                          <AlertCircle className="h-4 w-4 inline mr-2" />
                          {run.last_error_message}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications">
          <VendorCommunicationList communications={communications} />
        </TabsContent>

        <TabsContent value="logs">
          {selectedRun ? (
            <AgentRunLogs agentRun={selectedRun} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Select an agent run to view logs
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
