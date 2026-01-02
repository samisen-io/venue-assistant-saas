'use client'

import { useState } from 'react'
import { Check, Edit2, Calendar, Users, DollarSign, Tag, FileText, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EventExtractionOutput } from '@/lib/ai/prompts/eventExtraction'

interface EventExtractionPreviewProps {
  data: EventExtractionOutput
  onConfirm: (editedData: any) => void
  onCancel: () => void
}

export default function EventExtractionPreview({
  data,
  onConfirm,
  onCancel,
}: EventExtractionPreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState(data)

  const handleChange = (field: string, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleConfirm = () => {
    onConfirm(editedData)
  }

  const confidenceColor = data.confidence >= 0.8 ? 'text-green-600' : data.confidence >= 0.5 ? 'text-yellow-600' : 'text-red-600'
  const confidenceText = data.confidence >= 0.8 ? 'High' : data.confidence >= 0.5 ? 'Medium' : 'Low'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Event Details Extracted
            </CardTitle>
            <CardDescription>
              Review the extracted information and make any necessary changes
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Confidence:</span>
            <Badge variant="outline" className={confidenceColor}>
              {confidenceText} ({(data.confidence * 100).toFixed(0)}%)
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Low confidence warning */}
        {data.confidence < 0.7 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Please review carefully</p>
              <p>The AI had moderate confidence in extracting some details. Please verify all fields.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Event Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Event Name *
            </label>
            {isEditing ? (
              <Input
                value={editedData.event_name}
                onChange={(e) => handleChange('event_name', e.target.value)}
                placeholder="Event name"
              />
            ) : (
              <p className="text-sm p-2 bg-muted rounded">{editedData.event_name}</p>
            )}
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Event Type *
            </label>
            {isEditing ? (
              <Select
                value={editedData.event_type}
                onValueChange={(value) => handleChange('event_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="gala">Gala</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm p-2 bg-muted rounded capitalize">{editedData.event_type}</p>
            )}
          </div>

          {/* Event Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Event Date
            </label>
            {isEditing ? (
              <Input
                type="date"
                value={editedData.event_date || ''}
                onChange={(e) => handleChange('event_date', e.target.value)}
              />
            ) : (
              <p className="text-sm p-2 bg-muted rounded">
                {editedData.event_date
                  ? new Date(editedData.event_date).toLocaleDateString()
                  : 'Not specified'}
              </p>
            )}
          </div>

          {/* Event Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Event Time</label>
            {isEditing ? (
              <Input
                type="time"
                value={editedData.event_time || ''}
                onChange={(e) => handleChange('event_time', e.target.value)}
              />
            ) : (
              <p className="text-sm p-2 bg-muted rounded">
                {editedData.event_time || 'Not specified'}
              </p>
            )}
          </div>

          {/* Guest Count */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Guest Count
            </label>
            {isEditing ? (
              <Input
                type="number"
                value={editedData.guest_count || ''}
                onChange={(e) => handleChange('guest_count', parseInt(e.target.value) || 0)}
                placeholder="Number of guests"
              />
            ) : (
              <p className="text-sm p-2 bg-muted rounded">
                {editedData.guest_count || 'Not specified'}
              </p>
            )}
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget Total
            </label>
            {isEditing ? (
              <Input
                type="number"
                value={editedData.budget_total || ''}
                onChange={(e) => handleChange('budget_total', parseFloat(e.target.value) || 0)}
                placeholder="Total budget"
              />
            ) : (
              <p className="text-sm p-2 bg-muted rounded">
                {editedData.budget_total
                  ? `$${editedData.budget_total.toLocaleString()}`
                  : 'Not specified'}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {editedData.description && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            {isEditing ? (
              <Textarea
                value={editedData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            ) : (
              <p className="text-sm p-2 bg-muted rounded">{editedData.description}</p>
            )}
          </div>
        )}

        {/* Special Requirements */}
        {editedData.special_requirements && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Requirements</label>
            {isEditing ? (
              <Textarea
                value={editedData.special_requirements || ''}
                onChange={(e) => handleChange('special_requirements', e.target.value)}
                rows={2}
              />
            ) : (
              <p className="text-sm p-2 bg-muted rounded">{editedData.special_requirements}</p>
            )}
          </div>
        )}

        {/* Needed Services */}
        {editedData.needed_categories && editedData.needed_categories.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Services Needed</label>
            <div className="flex flex-wrap gap-2">
              {editedData.needed_categories.map((category) => (
                <Badge key={category} variant="secondary" className="capitalize">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Start Over
          </Button>

          <div className="flex gap-2">
            {isEditing ? (
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Done Editing
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            )}
            <Button onClick={handleConfirm}>
              <Check className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
