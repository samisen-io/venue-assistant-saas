"use client"

import { useEffect } from "react"
import { Check, X, AlertCircle, Users, MapPin } from "lucide-react"
import { Space } from "@/lib/types"
import { useSpaces } from "@/hooks/useSpaces"
import { useSpaceAvailability } from "@/hooks/useSpaceAvailability"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface SpaceSelectorProps {
    selectedSpaceId?: string | null
    onSelect: (spaceId: string) => void
    date?: string
    startTime?: string
    endTime?: string
    excludeEventId?: string
    disabled?: boolean
}

export function SpaceSelector({
    selectedSpaceId,
    onSelect,
    date,
    startTime,
    endTime,
    excludeEventId,
    disabled = false,
}: SpaceSelectorProps) {
    const { spaces, loading: spacesLoading } = useSpaces()

    // Check availability if date/time are provided
    const shouldCheckAvailability = !!(date && startTime && endTime)

    const { availability, loading: availabilityLoading } = useSpaceAvailability({
        date,
        startTime,
        endTime,
        excludeEventId,
        enabled: shouldCheckAvailability,
    })

    if (spacesLoading) {
        return <Skeleton className="h-10 w-full" />
    }

    if (spaces.length === 0) {
        return (
            <div className="text-sm text-muted-foreground">
                No spaces available. Please create a space first.
            </div>
        )
    }

    // Create a map of space availability
    const availabilityMap = new Map<string, boolean>()
    if (availability) {
        availability.forEach(item => {
            availabilityMap.set(item.space.id, item.isAvailable)
        })
    }

    const getAvailabilityStatus = (space: Space) => {
        if (!shouldCheckAvailability) {
            return null // Not checking availability
        }

        if (availabilityLoading) {
            return 'loading'
        }

        const isAvailable = availabilityMap.get(space.id)
        if (isAvailable === undefined) {
            return null
        }

        return isAvailable ? 'available' : 'unavailable'
    }

    const getAvailabilityIcon = (status: string | null) => {
        switch (status) {
            case 'available':
                return <Check className="h-4 w-4 text-green-600" />
            case 'unavailable':
                return <X className="h-4 w-4 text-red-600" />
            case 'loading':
                return <AlertCircle className="h-4 w-4 text-yellow-600 animate-pulse" />
            default:
                return null
        }
    }

    const getAvailabilityTooltip = (status: string | null) => {
        switch (status) {
            case 'available':
                return 'Space is available for this time'
            case 'unavailable':
                return 'Space is already booked for this time'
            case 'loading':
                return 'Checking availability...'
            default:
                return null
        }
    }

    return (
        <div className="space-y-2">
            <Select
                value={selectedSpaceId || ''}
                onValueChange={onSelect}
                disabled={disabled}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select a space" />
                </SelectTrigger>
                <SelectContent>
                    {spaces.map((space) => {
                        const status = getAvailabilityStatus(space)
                        const isUnavailable = status === 'unavailable'

                        return (
                            <SelectItem
                                key={space.id}
                                value={space.id}
                                disabled={isUnavailable}
                                className="cursor-pointer"
                            >
                                <div className="flex items-center justify-between w-full gap-2">
                                    <div className="flex items-center gap-2 flex-1">
                                        <span className="font-medium">{space.name}</span>

                                        {space.capacity && (
                                            <Badge variant="outline" className="text-xs">
                                                <Users className="h-3 w-3 mr-1" />
                                                {space.capacity}
                                            </Badge>
                                        )}

                                        {space.floor_level && (
                                            <Badge variant="outline" className="text-xs">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {space.floor_level}
                                            </Badge>
                                        )}
                                    </div>

                                    {status && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex items-center">
                                                        {getAvailabilityIcon(status)}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{getAvailabilityTooltip(status)}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                            </SelectItem>
                        )
                    })}
                </SelectContent>
            </Select>

            {selectedSpaceId && (
                <div className="text-sm text-muted-foreground">
                    {(() => {
                        const selectedSpace = spaces.find(s => s.id === selectedSpaceId)
                        if (!selectedSpace) return null

                        const status = getAvailabilityStatus(selectedSpace)

                        if (status === 'unavailable') {
                            return (
                                <div className="flex items-center gap-2 text-red-600">
                                    <X className="h-4 w-4" />
                                    <span>This space is not available for the selected time. Please choose a different space or time.</span>
                                </div>
                            )
                        }

                        if (status === 'available') {
                            return (
                                <div className="flex items-center gap-2 text-green-600">
                                    <Check className="h-4 w-4" />
                                    <span>Space is available for the selected time</span>
                                </div>
                            )
                        }

                        return null
                    })()}
                </div>
            )}
        </div>
    )
}
