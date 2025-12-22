import MarkdownEditor from "@/components/MarkdownEditor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router"
import { notesApi } from "@/api"
import { toast } from "sonner"

const Note = () => {
  const { id } = useParams<{ id: string }>()

  const [content, setContent] = useState('# sa')
  const [title, setTitle] = useState('Untitled')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    // 简单初始化标题，可后续接入获取详情接口
    setTitle(id ?? 'Untitled')
  }, [id])

  const handleTitleBlur = async () => {
    if (!id) return
    try {
      await notesApi.updateNoteTitle({ noteId: id, title })
      // 通知侧边树刷新
      window.dispatchEvent(new CustomEvent("tree:refresh"))
      toast.success("标题已更新")
    } catch (err) {
      // 错误已在 invoke 包装里 toast，这里兜底
      console.error(err)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur()
    }
  }

  const handleCreate = async () => {
    await notesApi.createNote({ title: 'New Note' })
  }

  return (
    <div className="h-screen flex flex-col p-4">
      {/* 固定区域 */}
      <div className="p-4 flex justify-between items-center gap-3">
        <Input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          className="max-w-xl"
        />
        <Button className="ml-4" onClick={handleCreate}>保存</Button>
      </div>

      {/* 剩余空间 */}
      <div className="flex-1 overflow-hidden border rounded-lg">
        <MarkdownEditor
          value={content}
          onChange={setContent}
        />
      </div>
    </div>
  )
}

export default Note