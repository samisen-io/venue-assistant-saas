'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AgentRun, AgentLogEntry } from '@/lib/types'
import { format } from 'date-fns'
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react'

interface AgentRunLogsProps {
  agentRun: AgentRun
}

export function AgentRunLogs({ agentRun }: AgentRunLogsProps) {
  const logs = (agentRun.logs as AgentLogEntry[]) || []

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getLogBadgeVariant = (level: string) => {
    switch (level) {
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      case 'warning':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Run Logs</CardTitle>
        <CardDescription>
          Detailed activity log for this agent run
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No logs available for this run
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log, index) => (
              <div
                key={index}
                className="border-l-2 border-border pl-4 py-2 hover:border-primary transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getLogIcon(log.level)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{log.message}</p>
                      <Badge variant={getLogBadgeVariant(log.level)} className="text-xs">
                        {log.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.timestamp), 'MMM d, yyyy h:mm:ss a')}
                    </p>
                    {log.details && (
                      <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
