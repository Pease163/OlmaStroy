import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, Search, Trash2, Copy, FileIcon, Loader2, LayoutGrid, List } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { uploadApi, type MediaFile } from '@/api/upload'
import { useDebounce } from '@/hooks/use-debounce'
import type { ApiError } from '@/types/api'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

export default function MediaPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [uploading, setUploading] = useState(false)
  const [deleteFile, setDeleteFile] = useState<string | null>(null)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const { data, isLoading } = useQuery({
    queryKey: ['media', debouncedSearch],
    queryFn: () => uploadApi.listMedia(debouncedSearch || undefined),
  })

  const deleteMutation = useMutation({
    mutationFn: (filename: string) => uploadApi.deleteMedia(filename),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
      toast.success('Файл удалён')
      setDeleteFile(null)
    },
    onError: (e: ApiError) => {
      toast.error(e.response?.data?.error?.message || 'Ошибка удаления')
    },
  })

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    let uploaded = 0

    for (const file of Array.from(files)) {
      try {
        await uploadApi.upload(file)
        uploaded++
      } catch {
        toast.error(`Ошибка: ${file.name}`)
      }
    }

    if (uploaded > 0) {
      queryClient.invalidateQueries({ queryKey: ['media'] })
      toast.success(`Загружено: ${uploaded} файл(ов)`)
    }
    setUploading(false)
    e.target.value = ''
  }, [queryClient])

  const copyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL скопирован')
  }, [])

  const files = data?.data || []
  const total = data?.meta.total || 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Медиа</h1>
        <label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button asChild disabled={uploading}>
            <span>
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Загрузить
            </span>
          </Button>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени файла..."
            className="pl-9"
          />
        </div>
        <div className="flex border rounded-md">
          <Button
            variant={view === 'grid' ? 'default' : 'ghost'}
            size="icon"
            className="h-9 w-9 rounded-r-none"
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="icon"
            className="h-9 w-9 rounded-l-none"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {total} файл(ов)
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <Skeleton className="w-full h-36 rounded-md mb-2" />
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? 'Файлы не найдены' : 'Нет загруженных файлов'}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map((file) => (
            <Card key={file.name} className="overflow-hidden group">
              <CardContent className="p-3">
                <div className="w-full h-36 rounded-md mb-2 bg-muted flex items-center justify-center overflow-hidden relative">
                  {file.is_image ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <FileIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => copyUrl(file.url)}
                      title="Копировать URL"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setDeleteFile(file.name)}
                      title="Удалить"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm font-medium truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-md divide-y">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors"
            >
              <div className="w-10 h-10 rounded flex items-center justify-center bg-muted/50 flex-shrink-0 overflow-hidden">
                {file.is_image ? (
                  <img src={file.url} alt="" className="w-full h-full object-cover rounded" />
                ) : (
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyUrl(file.url)}
                  title="Копировать URL"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteFile(file.name)}
                  title="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteFile !== null}
        onOpenChange={() => setDeleteFile(null)}
        title="Удалить файл?"
        description={`Файл "${deleteFile}" будет удалён. Это действие нельзя отменить.`}
        confirmLabel="Удалить"
        onConfirm={() => deleteFile && deleteMutation.mutate(deleteFile)}
      />
    </div>
  )
}
