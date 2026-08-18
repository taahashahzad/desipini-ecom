import { supabase } from '@/lib/supabase'

async function compressImage(file: File, maxWidth = 1600, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return file

  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onload = () => {
      img.src = reader.result as string
    }
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve(file)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => resolve(blob ?? file), 'image/webp', quality)
    }
    img.onerror = reject
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function uploadImage(
  bucket: 'product-images' | 'category-images' | 'avatars' | 'store-assets',
  file: File,
  onProgress?: (pct: number) => void
) {
  const compressed = await compressImage(file)
  const ext = file.type === 'image/svg+xml' ? 'svg' : 'webp'
  const path = `${crypto.randomUUID()}.${ext}`

  onProgress?.(20)
  const { error } = await supabase.storage.from(bucket).upload(path, compressed, {
    contentType: file.type === 'image/svg+xml' ? file.type : 'image/webp',
    upsert: false,
  })
  onProgress?.(90)
  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  onProgress?.(100)
  return { url: data.publicUrl, path }
}

export async function deleteImage(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}
