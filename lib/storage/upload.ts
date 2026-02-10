import { createClient } from '@/lib/supabase/client'
import { optimizeImageFile, type OptimizeImageOptions } from '@/lib/storage/optimize'

const VENUE_PHOTOS_BUCKET = 'venue-photos'

export type UploadPhotoOptions = {
  optimize?: boolean
  optimizeOptions?: OptimizeImageOptions
}

function sanitizeSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildStoragePath(venueId: string, subfolder: string, fileName: string): string {
  const sanitizedName = sanitizeSegment(fileName.replace(/\.[^.]+$/, ''))
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  const extension = fileName.includes('.') ? fileName.split('.').pop()!.toLowerCase() : 'jpg'
  return `${sanitizeSegment(venueId)}/${sanitizeSegment(subfolder)}/${sanitizedName}-${timestamp}-${random}.${extension}`
}

async function uploadFileToBucket(path: string, file: File): Promise<string> {
  const supabase = createClient()

  const { error: uploadError } = await supabase.storage
    .from(VENUE_PHOTOS_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream',
    })

  if (uploadError) {
    throw new Error(uploadError.message || 'Failed to upload image')
  }

  const { data } = supabase.storage.from(VENUE_PHOTOS_BUCKET).getPublicUrl(path)
  if (!data?.publicUrl) {
    throw new Error('Failed to retrieve public URL for uploaded image')
  }

  return data.publicUrl
}

async function prepareFileForUpload(
  file: File,
  options?: UploadPhotoOptions
): Promise<File> {
  if (!options?.optimize) return file
  return optimizeImageFile(file, options.optimizeOptions)
}

export async function uploadVenuePhoto(
  venueId: string,
  file: File,
  section: string,
  options?: UploadPhotoOptions
): Promise<string> {
  const prepared = await prepareFileForUpload(file, options)
  const path = buildStoragePath(venueId, section || 'gallery', prepared.name)
  return uploadFileToBucket(path, prepared)
}

export async function uploadHeroImage(
  venueId: string,
  file: File,
  options?: UploadPhotoOptions
): Promise<string> {
  const prepared = await prepareFileForUpload(file, options)
  const path = buildStoragePath(venueId, 'hero', prepared.name)
  return uploadFileToBucket(path, prepared)
}

export async function uploadTestimonialPhoto(
  venueId: string,
  file: File,
  options?: UploadPhotoOptions
): Promise<string> {
  const prepared = await prepareFileForUpload(file, options)
  const path = buildStoragePath(venueId, 'testimonials', prepared.name)
  return uploadFileToBucket(path, prepared)
}

export async function deleteVenuePhoto(pathOrPublicUrl: string): Promise<void> {
  const supabase = createClient()

  let relativePath = pathOrPublicUrl.trim()

  try {
    const parsed = new URL(pathOrPublicUrl)
    const marker = `/${VENUE_PHOTOS_BUCKET}/`
    const markerIndex = parsed.pathname.indexOf(marker)
    if (markerIndex >= 0) {
      relativePath = parsed.pathname.slice(markerIndex + marker.length)
    }
  } catch {
    // Keep original value when it's already a bucket-relative path.
  }

  relativePath = relativePath.replace(/^\/+/, '')
  if (!relativePath) throw new Error('Invalid photo path')

  const { error } = await supabase.storage.from(VENUE_PHOTOS_BUCKET).remove([relativePath])
  if (error) throw new Error(error.message || 'Failed to delete image')
}
