import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, Trash2, GripVertical, Loader2, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { projectImagesApi } from '@/api/project-images'
import { uploadApi } from '@/api/upload'
import type { ProjectImage } from '@/types/models'
import type { ApiError } from '@/types/api'

interface ProjectGalleryProps {
  projectId: number
}

export function ProjectGallery({ projectId }: ProjectGalleryProps) {
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['project-images', projectId],
    queryFn: () => projectImagesApi.list(projectId),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<ProjectImage>) => projectImagesApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-images', projectId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ imageId, data }: { imageId: number; data: Partial<ProjectImage> }) =>
      projectImagesApi.update(projectId, imageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-images', projectId] })
    },
  })

  const reorderMutation = useMutation({
    mutationFn: (ids: number[]) => projectImagesApi.reorder(projectId, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-images', projectId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (imageId: number) => projectImagesApi.delete(projectId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-images', projectId] })
      toast.success('Изображение удалено')
      setDeleteId(null)
    },
    onError: (e: ApiError) => {
      toast.error(e.response?.data?.error?.message || 'Ошибка удаления')
    },
  })

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    let added = 0

    for (const file of Array.from(files)) {
      try {
        const result = await uploadApi.upload(file)
        await createMutation.mutateAsync({
          image_url: result.url,
          order: images.length + added,
        })
        added++
      } catch {
        toast.error(`Ошибка загрузки: ${file.name}`)
      }
    }

    if (added > 0) {
      toast.success(`Загружено: ${added} фото`)
    }
    setUploading(false)
    e.target.value = ''
  }, [images.length, createMutation])

  const handleCaptionBlur = useCallback((imageId: number, caption: string) => {
    updateMutation.mutate({ imageId, data: { caption } })
  }, [updateMutation])

  const handleDragStart = useCallback((idx: number) => {
    setDragIdx(idx)
  }, [])

  const handleDrop = useCallback((dropIdx: number) => {
    if (dragIdx === null || dragIdx === dropIdx) return
    const reordered = [...images]
    const [moved] = reordered.splice(dragIdx, 1)
    reordered.splice(dropIdx, 0, moved)
    reorderMutation.mutate(reordered.map((img) => img.id))
    setDragIdx(null)
  }, [dragIdx, images, reorderMutation])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Загрузка...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Галерея ({images.length})</h2>
        <label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button variant="outline" size="sm" asChild disabled={uploading}>
            <span>
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Загрузить фото
            </span>
          </Button>
        </label>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-md">
          <ImageIcon className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm">Нет фотографий</p>
          <p className="text-xs mt-1">Загрузите фото проекта</p>
        </div>
      ) : (
        <div className="space-y-2">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="flex items-center gap-3 p-2 border rounded-md bg-card hover:bg-accent/50 transition-colors"
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(idx)}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />
              <img
                src={img.image_url}
                alt={img.caption || ''}
                className="w-16 h-12 object-cover rounded flex-shrink-0"
              />
              <Input
                defaultValue={img.caption || ''}
                placeholder="Подпись..."
                className="h-8 text-sm"
                onBlur={(e) => handleCaptionBlur(img.id, e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => setDeleteId(img.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Удалить фото?"
        description="Это действие нельзя отменить."
        confirmLabel="Удалить"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}
