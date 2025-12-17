import MarkdownEditor from "@/components/MarkdownEditor"
import { useState } from "react"

const Note = () => {
  const [content, setContent] = useState('# sa')
  return (
    <div className="h-screen flex flex-col p-4">
      {/* 固定区域 */}
      <h1 className="p-4 ">创建文章</h1>

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