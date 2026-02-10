"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import { UploadCloud, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { optimizeImageFile, type OptimizeImageOptions } from "@/lib/storage/optimize"

type UploadedPhoto = {
  file: File
  previewUrl: string
  uploadedUrl?: string
  progress: number
  status: "pending" | "uploading" | "uploaded" | "error"
  error?: string
}

interface PhotoUploaderProps {
  multiple?: boolean
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string[]
  optimize?: boolean
  optimizeOptions?: OptimizeImageOptions
  onUpload: (file: File, index: number) => Promise<string>
  onChange?: (uploadedUrls: string[]) => void
  className?: string
}

const DEFAULT_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export function PhotoUploader({
  multiple = true,
  maxFiles = 10,
  maxSizeMB = 10,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  optimize = true,
  optimizeOptions,
  onUpload,
  onChange,
  className = "",
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const maxBytes = maxSizeMB * 1024 * 1024
  const acceptValue = useMemo(() => acceptedTypes.join(","), [acceptedTypes])

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Unsupported file type: ${file.name}`
    }
    if (file.size > maxBytes) {
      return `File is too large (${file.name}). Max ${maxSizeMB}MB`
    }
    return null
  }

  const createPhotoRecord = (file: File): UploadedPhoto => ({
    file,
    previewUrl: URL.createObjectURL(file),
    progress: 0,
    status: "pending",
  })

  const emitUploadedUrls = (items: UploadedPhoto[]) => {
    if (!onChange) return
    onChange(items.filter((x) => x.uploadedUrl).map((x) => x.uploadedUrl as string))
  }

  const addFiles = async (incoming: File[]) => {
    const slots = Math.max(0, maxFiles - photos.length)
    const next = incoming.slice(0, slots)
    if (next.length === 0) return

    const valid: File[] = []
    for (const file of next) {
      const error = validateFile(file)
      if (error) {
        toast({ title: "Upload Error", description: error, variant: "destructive" })
      } else {
        valid.push(file)
      }
    }

    const prepared: File[] = []
    for (const file of valid) {
      prepared.push(optimize ? await optimizeImageFile(file, optimizeOptions) : file)
    }

    const records = prepared.map(createPhotoRecord)
    setPhotos((prev) => (multiple ? [...prev, ...records] : records.slice(0, 1)))
  }

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || [])
    await addFiles(selected)
    event.target.value = ""
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const dropped = Array.from(event.dataTransfer.files || []).filter((f) => f.type.startsWith("image/"))
    await addFiles(dropped)
  }

  const uploadAll = async () => {
    setIsUploading(true)
    try {
      for (let i = 0; i < photos.length; i++) {
        if (photos[i].status === "uploaded") continue

        setPhotos((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, status: "uploading", progress: 20 } : p))
        )

        try {
          const uploadedUrl = await onUpload(photos[i].file, i)
          setPhotos((prev) =>
            prev.map((p, idx) =>
              idx === i
                ? { ...p, status: "uploaded", progress: 100, uploadedUrl, error: undefined }
                : p
            )
          )
        } catch (error) {
          setPhotos((prev) =>
            prev.map((p, idx) =>
              idx === i
                ? {
                    ...p,
                    status: "error",
                    progress: 0,
                    error: error instanceof Error ? error.message : "Upload failed",
                  }
                : p
            )
          )
        }
      }

      setPhotos((prev) => {
        emitUploadedUrls(prev)
        return prev
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const target = prev[index]
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      const next = prev.filter((_, i) => i !== index)
      emitUploadedUrls(next)
      return next
    })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/30"
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptValue}
          multiple={multiple}
          className="hidden"
          onChange={handleInputChange}
        />

        <UploadCloud className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drag and drop images here, or click to select files
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Accepted: JPG, PNG, WebP | Max {maxSizeMB}MB each
        </p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => inputRef.current?.click()}>
          Choose Photos
        </Button>
      </div>

      {photos.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, index) => (
              <div key={`${photo.file.name}-${index}`} className="rounded-md border p-2">
                <div className="relative mb-2 aspect-video overflow-hidden rounded">
                  <Image
                    src={photo.previewUrl}
                    alt={photo.file.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="space-y-1">
                  <p className="truncate text-xs text-muted-foreground">{photo.file.name}</p>

                  {photo.status === "uploading" && <Progress value={photo.progress} className="h-2" />}
                  {photo.status === "uploaded" && <p className="text-xs text-green-600">Uploaded</p>}
                  {photo.status === "error" && (
                    <p className="text-xs text-destructive">{photo.error || "Upload failed"}</p>
                  )}
                </div>

                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePhoto(index)}
                    aria-label={`Remove ${photo.file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={uploadAll} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Selected Photos"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
