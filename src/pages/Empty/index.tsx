import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { FileText } from "lucide-react"

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyContent,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

const EmptyPage = () => {
  const navigate = useNavigate()

  const handleBack = useCallback(() => {
    navigate("/")
  }, [navigate])

  return (
    <div className="h-screen flex flex-col p-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText className="size-6" />
          </EmptyMedia>
          <EmptyTitle>暂无内容</EmptyTitle>
        </EmptyHeader>

        <EmptyContent>
          <div className="flex gap-2">
            <Button onClick={handleBack}>返回首页</Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  )
}

export default EmptyPage