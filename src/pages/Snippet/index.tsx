import { useParams } from "react-router"

const Snippet = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-xl font-semibold">Snippet</h1>
      <p className="text-sm text-muted-foreground">当前片段 ID：{id}</p>
    </div>
  )
}

export default Snippet

