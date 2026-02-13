import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, ImageIcon, Undo, Redo, Palette,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useEffect, useCallback } from 'react'

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export function TiptapEditor({ content, onChange, placeholder = 'Начните писать...' }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline' } }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full h-auto rounded' } }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false)
    }
  }, [content]) // eslint-disable-line react-hooks/exhaustive-deps

  const addLink = useCallback(() => {
    if (!editor) return
    const url = window.prompt('URL ссылки:', 'https://')
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('URL изображения:', '/static/uploads/')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className="tiptap-editor rounded-md border border-input">
      <div className="flex flex-wrap items-center gap-0.5 border-b p-1.5">
        <ToolButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Жирный"
        >
          <Bold className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Курсив"
        >
          <Italic className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Подчёркнутый"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Зачёркнутый"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Заголовок 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Заголовок 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Заголовок 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Маркированный список"
        >
          <List className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Нумерованный список"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Цитата"
        >
          <Quote className="h-4 w-4" />
        </ToolButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="По левому краю"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="По центру"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="По правому краю"
        >
          <AlignRight className="h-4 w-4" />
        </ToolButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolButton onClick={addLink} active={editor.isActive('link')} title="Ссылка">
          <LinkIcon className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={addImage} title="Изображение">
          <ImageIcon className="h-4 w-4" />
        </ToolButton>

        <div className="relative">
          <input
            type="color"
            className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            title="Цвет текста"
          />
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Palette className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolButton onClick={() => editor.chain().focus().undo().run()} title="Отменить">
          <Undo className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().redo().run()} title="Повторить">
          <Redo className="h-4 w-4" />
        </ToolButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

function ToolButton({ children, onClick, active, title }: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  title?: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={`h-8 w-8 p-0 ${active ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  )
}
