import MarkdownEditor from "@/components/MarkdownEditor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router"
import { notesApi } from "@/api"
import { toast } from "sonner"

const Note = () => {
  const { id } = useParams<{ id: string }>()

  const [content, setContent] = useState('')
  const [title, setTitle] = useState('Untitled')
  const [loading, setLoading] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const fetch = async () => {
      if (!id) return
      try {
        setLoading(true)
        const detail = await notesApi.getNote(id)
        setTitle(detail.title || 'Untitled')
        setContent(detail.content || '')
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleTitleBlur = async () => {
    if (!id) {
      setEditingTitle(false)
      return
    }
    try {
      await notesApi.updateNoteTitle({ noteId: id, title })
      // 通知侧边树刷新
      window.dispatchEvent(new CustomEvent("tree:refresh"))
      toast.success("标题已更新")
    } catch (err) {
      console.error(err)
    } finally {
      setEditingTitle(false)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur()
    }
  }

  const handleSave = async () => {
    if (!id) return
    try {
      await notesApi.updateNoteContent({ noteId: id, content })
      toast.success("已保存")
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="h-screen flex flex-col p-4">
      {/* 固定区域 */}
      <div className="p-4 flex justify-between items-center gap-3">
        {editingTitle ? (
          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="max-w-xl"
            autoFocus
          />
        ) : (
          <span
            className="max-w-xl truncate text-lg font-medium cursor-text"
            onClick={() => {
              setEditingTitle(true)
              requestAnimationFrame(() => inputRef.current?.focus())
            }}
            title={title}
          >
            {title || "未命名"}
          </span>
        )}
        <Button className="ml-4" onClick={handleSave}>保存</Button>
      </div>

      {/* 剩余空间 */}
      <div className="flex-1 overflow-hidden border rounded-lg">
        <MarkdownEditor
          value={content}
          onChange={setContent}
          disabled={loading}
        />
      </div>
    </div>
  )
}

export default Note