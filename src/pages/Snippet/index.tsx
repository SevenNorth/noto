import { useParams } from "react-router"
import { useEffect, useState, useRef } from "react"
import { snippetApi } from "@/api"
import { CodeEditor } from "@/components/CodeEditor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const PROGRAMMING_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
] as const

const Snippet = () => {
  const { id } = useParams<{ id: string }>()
  const [snippet, setSnippet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [language, setLanguage] = useState("")
  const [content, setContent] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (id) {
      loadSnippet()
    }
  }, [id])

  const loadSnippet = async () => {
    try {
      const data = await snippetApi.getSnippet(id!)
      setSnippet(data)
      setTitle(data.title)
      setLanguage(data.language || "")
      setContent(data.content)
    } catch (error) {
      toast.error("加载代码片段失败")
    } finally {
      setLoading(false)
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
      await snippetApi.updateSnippet({
        snippetId: id,
        title,
        language: language || undefined,
        content
      })
      setEditing(false)
      toast.success("保存成功")
      loadSnippet() // 重新加载以获取最新数据
    } catch (error) {
      toast.error("保存失败")
    }
  }

  if (loading) {
    return <div className="p-4">加载中...</div>
  }

  if (!snippet) {
    return <div className="p-4">代码片段不存在</div>
  }

  return (
    <div className="h-screen flex flex-col p-4">
      {/* 固定区域 */}
      <div className="p-4 flex justify-between items-center gap-3">
        <div className="flex items-center gap-4">
          {editing ? (
            <Input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              className="w-64 max-w-xl"
              autoFocus
            />
          ) : (
            <span
              className="w-64 max-w-xl truncate text-lg font-medium cursor-text"
              onClick={() => {
                setEditing(true)
                requestAnimationFrame(() => inputRef.current?.focus())
              }}
              title={title}
            >
              {title || "未命名"}
            </span>
          )}
          <Select value={language} onValueChange={setLanguage} disabled={!editing}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="选择语言" />
            </SelectTrigger>
            <SelectContent>
              {PROGRAMMING_LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => editing ? handleSave() : setEditing(true)}
          variant={editing ? "default" : "outline"}
        >
          {editing ? "保存" : "编辑"}
        </Button>
      </div>

      {/* 剩余空间 */}
      <div className="flex-1 overflow-hidden border rounded-lg">
        <CodeEditor
          value={content}
          language={language || "plaintext"}
          onChange={setContent}
          height="100%"
          readOnly={!editing}
        />
      </div>
    </div>
  )
}

export default Snippet

