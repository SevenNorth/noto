import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface TaskDetail {
  id: string
  nodeId: string
  title: string
  status: string
  priority: number
  dueDate?: number
  description?: string
  createdAt: number
  updatedAt: number
  totalDuration: number
}

const STATUS_OPTIONS = ["todo", "doing", "done"] as const

interface TaskDetailContentProps {
  currentTask: TaskDetail
  totalDuration: number
  timeEntries: any[]
  onTaskChange: (task: TaskDetail) => void
  onAddEntry: (workDate: number, duration: number, description: string) => void
  onDeleteTimeEntry: (entryId: string) => void
}

export function TaskDetailContent({
  currentTask,
  totalDuration,
  timeEntries,
  onTaskChange,
  onAddEntry,
  onDeleteTimeEntry,
}: TaskDetailContentProps) {
  const [newEntryDate, setNewEntryDate] = useState(new Date().toISOString().split('T')[0])
  const [newEntryDesc, setNewEntryDesc] = useState("")
  const [newEntryDuration, setNewEntryDuration] = useState(0)
  return (
    <div className="flex-1 overflow-auto">
      <div className="space-y-4 pr-4">
        <div>
          <label className="block text-sm font-medium mb-1">标题</label>
          <Input
            value={currentTask.title}
            onChange={(e) => onTaskChange({ ...currentTask, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">描述</label>
          <Input
            placeholder="任务描述"
            value={currentTask.description || ""}
            onChange={(e) => onTaskChange({ ...currentTask, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">状态</label>
          <Select
            value={currentTask.status}
            onValueChange={(v) => onTaskChange({ ...currentTask, status: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">优先级</label>
          <Input
            type="number"
            value={currentTask.priority}
            onChange={(e) =>
              onTaskChange({ ...currentTask, priority: Number(e.target.value) })
            }
          />
        </div>

        {/* 时间记录 */}
        <div>
          <label className="block text-sm font-medium mb-2">时间消耗</label>
          <div className="border rounded-lg p-3 bg-muted/30 max-h-48 overflow-auto mb-3 space-y-2">
            {timeEntries.map((te) => (
              <div key={te.id} className="text-sm flex justify-between items-center bg-background p-2 rounded border">
                <div className="flex-1">
                  <div className="font-medium">{te.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(te.workDate).toLocaleDateString()} · {(te.duration / 3600).toFixed(1)}小时
                  </div>
                </div>
                <button
                  onClick={() => onDeleteTimeEntry(te.id)}
                  className="ml-2 p-1 hover:bg-destructive/10 text-destructive rounded transition-colors"
                  title="删除"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {timeEntries.length === 0 && (
              <div className="text-muted-foreground text-sm text-center py-2">暂无记录</div>
            )}
          </div>
          <div className="space-y-2">
            <Input
              type="date"
              value={newEntryDate}
              onChange={(e) => setNewEntryDate(e.target.value)}
            />
            <Input
              placeholder="说明"
              value={newEntryDesc}
              onChange={(e) => setNewEntryDesc(e.target.value)}
            />
            <Input
              type="number"
              placeholder="小时"
              value={newEntryDuration}
              onChange={(e) => setNewEntryDuration(Number(e.target.value))}
              min={0}
              step={0.5}
            />
          </div>
          <Button className="mt-3 w-full" size="sm" onClick={() => onAddEntry(new Date(newEntryDate).getTime(), Math.round(newEntryDuration * 3600), newEntryDesc)}>添加记录</Button>
        </div>
      </div>
    </div>
  )
}
