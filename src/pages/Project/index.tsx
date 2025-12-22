import { useParams } from "react-router"

const Project = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-xl font-semibold">Project</h1>
      <p className="text-sm text-muted-foreground">当前项目 ID：{id}</p>
    </div>
  )
}

export default Project

