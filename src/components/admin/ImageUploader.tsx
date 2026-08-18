import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Upload, X, Star, GripVertical, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { uploadImage } from '@/services/storage'

export interface ImageItem {
  url: string
  is_primary: boolean
  sort_order: number
  alt?: string
}

export function ImageUploader({
  images,
  onChange,
  bucket = 'product-images',
}: {
  images: ImageItem[]
  onChange: (images: ImageItem[]) => void
  bucket?: 'product-images' | 'category-images'
}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setProgress(0)
    try {
      const uploaded: ImageItem[] = []
      for (let i = 0; i < files.length; i++) {
        const { url } = await uploadImage(bucket, files[i], (p) => setProgress(Math.round(((i + p / 100) / files.length) * 100)))
        uploaded.push({ url, is_primary: images.length === 0 && i === 0, sort_order: images.length + i })
      }
      onChange([...images, ...uploaded])
    } catch (e: any) {
      toast.error('Upload failed', { description: e.message })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  function removeAt(index: number) {
    const next = images.filter((_, i) => i !== index)
    if (next.length > 0 && !next.some((i) => i.is_primary)) next[0].is_primary = true
    onChange(next.map((img, i) => ({ ...img, sort_order: i })))
  }

  function setPrimary(index: number) {
    onChange(images.map((img, i) => ({ ...img, is_primary: i === index })))
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) return
    const next = [...images]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(index, 0, moved)
    onChange(next.map((img, i) => ({ ...img, sort_order: i })))
    setDragIndex(null)
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors py-8 px-4 text-center',
          dragOver ? 'border-moss bg-moss/5' : 'border-sand-line hover:border-ink/30'
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="h-5 w-5 text-moss animate-spin" />
            <p className="text-sm text-ink/60">Uploading… {progress}%</p>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 text-ink/35" />
            <p className="text-sm text-ink/60">Drag & drop images, or click to browse</p>
            <p className="text-xs text-ink/35">PNG, JPG, WEBP up to ~5MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
          {images.map((img, i) => (
            <div
              key={img.url + i}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              className="relative group aspect-square rounded-md overflow-hidden bg-sand/50 border border-sand-line cursor-move"
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors" />
              <div className="absolute top-1.5 left-1.5 flex gap-1">
                <span className="p-1 rounded bg-white/80 text-ink/50"><GripVertical className="h-3 w-3" /></span>
              </div>
              <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => removeAt(i)} className="p-1 rounded bg-white/90 text-danger" aria-label="Remove image">
                  <X className="h-3 w-3" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setPrimary(i)}
                className={cn(
                  'absolute bottom-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors',
                  img.is_primary ? 'bg-moss text-bone' : 'bg-white/80 text-ink/50 opacity-0 group-hover:opacity-100'
                )}
              >
                <Star className={cn('h-2.5 w-2.5', img.is_primary && 'fill-current')} />
                {img.is_primary ? 'Primary' : 'Set primary'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
