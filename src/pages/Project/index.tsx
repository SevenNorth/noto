import { useParams } from "react-router"
import { useEffect, useState } from "react"
import { tasksApi, timeEntryApi } from "@/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { toast } from "sonner"
import { X } from "lucide-react"
import { useConfirm } from "@/hooks/use-comfirm"
import { TaskDetailContent } from "./TaskDetailContent"

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

const Project = () => {
  const { id } = useParams<{ id: string }>()
  const [tasks, setTasks] = useState<TaskDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [totalProjectDuration, setTotalProjectDuration] = useState(0)

  const [newTitle, setNewTitle] = useState("")

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<TaskDetail | null>(null)

  const [timeEntries, setTimeEntries] = useState<any[]>([])
  const [newEntryDesc, setNewEntryDesc] = useState("")
  const [newEntryDuration, setNewEntryDuration] = useState(0)
  const [newEntryDate, setNewEntryDate] = useState(new Date().toISOString().split('T')[0])

  const confirm = useConfirm()

  const loadTasks = async () => {
    if (!id) return
    setLoading(true)
    try {
      const list = await tasksApi.listTasks(id)

      // 为每个任务计算总耗时
      const tasksWithDuration = await Promise.all(
        list.map(async (task) => {
          try {
            const timeEntries = await timeEntryApi.list(task.id)
            const totalDuration = timeEntries.reduce((sum, entry) => sum + entry.duration, 0)
            return { ...task, totalDuration }
          } catch (err) {
            console.error(`Failed to load time entries for task ${task.id}:`, err)
            return { ...task, totalDuration: 0 }
          }
        })
      )

      setTasks(tasksWithDuration)

      // 计算项目总耗时
      const totalDuration = tasksWithDuration.reduce((sum, task) => sum + task.totalDuration, 0)
      setTotalProjectDuration(totalDuration)
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

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = await confirm({
      title: "确认删除",
      description: "此操作无法撤销，确定要删除这个任务吗？",
      confirmText: "删除",
      cancelText: "取消",
    })
    if (!confirmed) return
    try {
      const taskToDelete = tasks.find(t => t.id === taskId)
      await tasksApi.deleteTask(taskId)
      setTasks(tasks.filter(t => t.id !== taskId))
      if (taskToDelete) {
        setTotalProjectDuration(prev => prev - taskToDelete.totalDuration)
      }
      toast.success("任务已删除")
    } catch (err) {
      toast.error("删除任务失败")
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
        description: currentTask.description,
      })
      toast.success("更新成功")
      loadTasks()
      setDrawerOpen(false)
    } catch (err) {
      toast.error("更新失败")
    }
  }

  const handleAddEntry = async (workDate: number, duration: number, description: string) => {
    if (!currentTask || !description || duration <= 0) return
    try {
      await timeEntryApi.create({
        taskId: currentTask.id,
        workDate,
        duration,
        description,
      })
      loadTimeEntries(currentTask.id)

      // 更新任务的总耗时
      setTasks(tasks.map(t =>
        t.id === currentTask.id
          ? { ...t, totalDuration: t.totalDuration + duration }
          : t
      ))
      setTotalProjectDuration(prev => prev + duration)

      toast.success("记录已添加")
    } catch (err) {
      console.log(err);
      toast.error("添加失败")
    }
  }

  const handleDeleteTimeEntry = async (entryId: string) => {
    try {
      const entryToDelete = timeEntries.find(te => te.id === entryId)
      await timeEntryApi.delete(entryId)

      if (entryToDelete && currentTask) {
        // 更新任务的总耗时
        setTasks(tasks.map(t =>
          t.id === currentTask.id
            ? { ...t, totalDuration: t.totalDuration - entryToDelete.duration }
            : t
        ))
        setTotalProjectDuration(prev => prev - entryToDelete.duration)
      }

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

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          {tasks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">暂无任务</div>
          ) : (
            <ul className="space-y-2 p-1">
              {tasks.map((t) => (
                <li
                  key={t.id}
                  className="p-2 border rounded hover:bg-accent/10 cursor-pointer flex justify-between items-center"
                  onClick={() => openTask(t)}
                >
                  <div className="flex items-center gap-3">
                    <span>{t.title}</span>
                    <span className="text-sm text-blue-600 font-medium">
                      {Math.floor(t.totalDuration / 3600)}h {Math.floor((t.totalDuration % 3600) / 60)}m
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t.status}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTask(t.id)
                      }}
                      className="p-1 hover:bg-destructive/10 text-destructive rounded transition-colors"
                      title="删除任务"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {tasks.length > 0 && (
          <div className="p-3 bg-muted/50 rounded-lg border mt-2">
            <div className="text-sm font-medium text-center">
              项目总耗时: {(totalProjectDuration / 3600).toFixed(1)}小时
            </div>
          </div>
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
            <TaskDetailContent
              currentTask={currentTask}
              totalDuration={totalDuration}
              timeEntries={timeEntries}
              onTaskChange={setCurrentTask}
              onAddEntry={handleAddEntry}
              onDeleteTimeEntry={handleDeleteTimeEntry}
            />
          )}
          <SheetFooter className="flex justify-end mt-4 border-t pt-4">
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

