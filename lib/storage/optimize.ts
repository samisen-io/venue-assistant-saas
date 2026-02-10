export type OptimizeImageOptions = {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  targetMaxBytes?: number
  preferredFormat?: 'image/webp' | 'image/jpeg'
}

const DEFAULT_OPTIONS: Required<OptimizeImageOptions> = {
  maxWidth: 2000,
  maxHeight: 2000,
  quality: 0.82,
  targetMaxBytes: 500 * 1024,
  preferredFormat: 'image/webp',
}

function mergeOptions(options?: OptimizeImageOptions): Required<OptimizeImageOptions> {
  return { ...DEFAULT_OPTIONS, ...(options || {}) }
}

function supportsWebP(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return canvas.toDataURL('image/webp').startsWith('data:image/webp')
  } catch {
    return false
  }
}

async function readImageBitmap(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file)
}

function scaleDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const scale = Math.min(1, maxWidth / width, maxHeight / height)
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Failed to encode image'))
        resolve(blob)
      },
      type,
      quality
    )
  })
}

export async function optimizeImageFile(
  file: File,
  options?: OptimizeImageOptions
): Promise<File> {
  if (typeof window === 'undefined') return file
  if (!file.type.startsWith('image/')) return file

  const cfg = mergeOptions(options)
  const bitmap = await readImageBitmap(file)

  const { width, height } = scaleDimensions(bitmap.width, bitmap.height, cfg.maxWidth, cfg.maxHeight)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file

  ctx.drawImage(bitmap, 0, 0, width, height)

  const outputType =
    cfg.preferredFormat === 'image/webp' && supportsWebP() ? 'image/webp' : 'image/jpeg'

  let quality = cfg.quality
  let blob = await canvasToBlob(canvas, outputType, quality)

  while (blob.size > cfg.targetMaxBytes && quality > 0.45) {
    quality -= 0.07
    blob = await canvasToBlob(canvas, outputType, quality)
  }

  if (blob.size >= file.size) return file

  const extension = outputType === 'image/webp' ? 'webp' : 'jpg'
  const baseName = file.name.replace(/\.[^.]+$/, '')
  return new File([blob], `${baseName}.${extension}`, {
    type: outputType,
    lastModified: Date.now(),
  })
}
