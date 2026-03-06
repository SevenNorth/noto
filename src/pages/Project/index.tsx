import { useParams } from "react-router"
import { useEffect, useState } from "react"
import { tasksApi, timeEntryApi } from "@/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { toast } from "sonner"
import { X } from "lucide-react"

interface TaskDetail {
  id: string
  nodeId: string
  title: string
  status: string
  priority: number
  dueDate?: number
  createdAt: number
  updatedAt: number
}

const STATUS_OPTIONS = ["todo", "doing", "done"] as const

const Project = () => {
  const { id } = useParams<{ id: string }>()
  const [tasks, setTasks] = useState<TaskDetail[]>([])
  const [loading, setLoading] = useState(true)

  const [newTitle, setNewTitle] = useState("")

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<TaskDetail | null>(null)

  const [timeEntries, setTimeEntries] = useState<any[]>([])
  const [newEntryDesc, setNewEntryDesc] = useState("")
  const [newEntryDuration, setNewEntryDuration] = useState(0)
  const [newEntryDate, setNewEntryDate] = useState(new Date().toISOString().split('T')[0])

  const loadTasks = async () => {
    if (!id) return
    setLoading(true)
    try {
      const list = await tasksApi.listTasks(id)
      setTasks(list)
    } catch (err) {
      toast.error("获取任务列表失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [id])

  const handleCreate = async () => {
    if (!id || !newTitle.trim()) return
    try {
      await tasksApi.createTask({ nodeId: id, title: newTitle.trim() })
      setNewTitle("")
      loadTasks()
      toast.success("任务创建成功")
    } catch (err) {
      toast.error("创建任务失败")
    }
  }

  const openTask = (task: TaskDetail) => {
    setCurrentTask(task)
    setDrawerOpen(true)
  }

  const totalDuration = timeEntries.reduce((acc, e) => acc + e.duration, 0);

  const loadTimeEntries = async (taskId: string) => {
    try {
      const list = await timeEntryApi.list(taskId)
      setTimeEntries(list)
    } catch (err) {
      toast.error("获取工时记录失败")
    }
  }

  useEffect(() => {
    if (currentTask) {
      loadTimeEntries(currentTask.id)
    } else {
      setTimeEntries([])
    }
  }, [currentTask])

  const handleSaveTask = async () => {
    if (!currentTask) return
    try {
      await tasksApi.updateTask({
        taskId: currentTask.id,
        title: currentTask.title,
        status: currentTask.status,
        priority: currentTask.priority,
        dueDate: currentTask.dueDate,
      })
      toast.success("更新成功")
      loadTasks()
      setDrawerOpen(false)
    } catch (err) {
      toast.error("更新失败")
    }
  }

  const handleAddEntry = async () => {
    if (!currentTask || !newEntryDesc || newEntryDuration <= 0) return
    try {
      await timeEntryApi.create({
        taskId: currentTask.id,
        workDate: new Date(newEntryDate).getTime(),
        duration: newEntryDuration,
        description: newEntryDesc,
      })
      setNewEntryDesc("")
      setNewEntryDuration(0)
      setNewEntryDate(new Date().toISOString().split('T')[0])
      loadTimeEntries(currentTask.id)
      toast.success("记录已添加")
    } catch (err) {
      toast.error("添加失败")
    }
  }

  const handleDeleteTimeEntry = async (entryId: string) => {
    try {
      await timeEntryApi.delete(entryId)
      toast.success("时间消耗已删除")
      if (currentTask) {
        loadTimeEntries(currentTask.id)
      }
    } catch (err) {
      toast.error("删除失败")
    }
  }

  if (loading) {
    return <div className="p-4">加载中...</div>
  }

  return (
    <div className="h-screen flex flex-col p-4">
      <div className="flex items-center gap-2 mb-4">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="新任务标题"
        />
        <Button onClick={handleCreate}>添加任务</Button>
      </div>

      <div className="flex-1 overflow-auto">
        {tasks.length === 0 ? (
          <div className="text-center text-muted-foreground">暂无任务</div>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="p-2 border rounded hover:bg-accent/10 cursor-pointer flex justify-between"
                onClick={() => openTask(t)}
              >
                <span>{t.title}</span>
                <span className="text-sm text-muted-foreground">{t.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* drawer for task detail */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-96 flex flex-col">
          <SheetHeader>
            <SheetTitle>任务详情</SheetTitle>
            <SheetDescription>查看/编辑任务信息</SheetDescription>
          </SheetHeader>
          {currentTask && (
            <div className="flex-1 overflow-auto">
              <div className="space-y-4 pr-4">
                <div className="text-sm text-muted-foreground">
                  已用时间: {totalDuration} 秒
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">标题</label>
                  <Input
                    value={currentTask.title}
                    onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">状态</label>
                  <Select
                    value={currentTask.status}
                    onValueChange={(v) => setCurrentTask({ ...currentTask, status: v })}
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
                      setCurrentTask({ ...currentTask, priority: Number(e.target.value) })
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
                            {new Date(te.workDate).toLocaleDateString()} · {te.duration}秒
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteTimeEntry(te.id)}
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
                      placeholder="秒"
                      value={newEntryDuration}
                      onChange={(e) => setNewEntryDuration(Number(e.target.value))}
                    />
                  </div>
                  <Button className="mt-3 w-full" size="sm" onClick={handleAddEntry}>添加记录</Button>
                </div>
              </div>
            </div>
          )}
          <SheetFooter className="flex justify-between mt-4 border-t pt-4">
            <Button variant="destructive" onClick={async () => {
              if (!currentTask) return;
              try {
                await tasksApi.deleteTask(currentTask.id);
                toast.success("已删除");
                setDrawerOpen(false);
                loadTasks();
              } catch (e) {
                toast.error("删除失败");
              }
            }}>
              删除
            </Button>
            <div className="flex gap-2">
              <SheetClose asChild>
                <Button variant="outline">取消</Button>
              </SheetClose>
              <Button onClick={handleSaveTask}>保存</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default Project

