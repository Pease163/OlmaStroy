import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { Search, FileText, Briefcase, Building2, MessageSquare } from 'lucide-react'
import { searchApi } from '@/api/search'
import { useDebounce } from '@/hooks/use-debounce'
import type { SearchResult } from '@/types/models'

const typeIcons: Record<string, React.ElementType> = {
  blog_post: FileText,
  vacancy: Briefcase,
  project: Building2,
  contact: MessageSquare,
}

const typeLabels: Record<string, string> = {
  blog_post: 'Блог',
  vacancy: 'Вакансии',
  project: 'Проекты',
  contact: 'Заявки',
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearch({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const navigate = useNavigate()

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    searchApi.search(debouncedQuery)
      .then((data) => setResults(data.results))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onOpenChange])

  const handleSelect = useCallback((url: string) => {
    navigate(url)
    onOpenChange(false)
    setQuery('')
  }, [navigate, onOpenChange])

  if (!open) return null

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {})

  return (
    <div className="fixed inset-0 z-50" onClick={() => onOpenChange(false)}>
      <div className="fixed inset-0 bg-black/50" />
      <div className="fixed left-1/2 top-[20%] w-full max-w-lg -translate-x-1/2" onClick={(e) => e.stopPropagation()}>
        <Command className="rounded-xl border bg-popover shadow-2xl">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Поиск по сайту..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            {loading && <Command.Loading><p className="p-4 text-sm text-center text-muted-foreground">Поиск...</p></Command.Loading>}
            {!loading && query.length >= 2 && results.length === 0 && (
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                Ничего не найдено
              </Command.Empty>
            )}
            {Object.entries(grouped).map(([type, items]) => {
              const Icon = typeIcons[type] || FileText
              return (
                <Command.Group key={type} heading={typeLabels[type] || type} className="px-1 py-2">
                  {items.map((item) => (
                    <Command.Item
                      key={`${type}-${item.id}`}
                      value={`${item.title} ${item.subtitle || ''}`}
                      onSelect={() => handleSelect(item.url)}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )
            })}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
