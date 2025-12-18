import MarkdownEditor from "@/components/MarkdownEditor"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useParams } from "react-router"
import { notesApi } from "@/api"

const Note = () => {
  const { id } = useParams<{ id: string }>()

  const [content, setContent] = useState('# sa')

  const handleCreate = async () => {
    await notesApi.createNote({ title: 'New Note' })
  }

  return (
    <div className="h-screen flex flex-col p-4">
      {/* 固定区域 */}
      <h1 className="p-4 flex justify-between items-center ">
        <span>{id}</span>
        <Button className="ml-4" onClick={handleCreate}>保存</Button>
      </h1>

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