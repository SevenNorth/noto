"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

import { useTree, useTreeProps } from "@/hooks/use-tree"
import type { TreeNode } from "@/lib/types"
/* =====================================================
 * Tree UI Component (shadcn + Headless Tree)
 * ===================================================== */

export interface UITreeProps extends useTreeProps {
  /** 节点右侧操作插槽 */
  renderActions?: (node: TreeNode) => React.ReactNode

  /** 自定义节点内容（高级） */
  renderLabel?: (node: TreeNode) => React.ReactNode
}

export function Tree(props: UITreeProps) {
  const { renderActions, renderLabel } = props

  const tree = useTree(props)

  return (
    <div className="space-y-1">
      {tree.data.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          level={0}
          tree={tree}
          renderActions={renderActions}
          renderLabel={renderLabel}
        />
      ))}
    </div>
  )
}

/* =====================================================
 * TreeItem
 * ===================================================== */

interface TreeItemProps {
  node: TreeNode
  level: number
  tree: ReturnType<typeof useTree>
  renderActions?: (node: TreeNode) => React.ReactNode
  renderLabel?: (node: TreeNode) => React.ReactNode
}

function TreeItem({
  node,
  level,
  tree,
  renderActions,
  renderLabel,
}: TreeItemProps) {
  const hasChildren = !!node.children?.length
  const open = tree.isExpanded(node.id)
  const selected = tree.isSelected(node.id)

  const row = (
    <div
      className={cn(
        "flex w-full items-center gap-1 rounded-md px-2 py-1 text-sm cursor-pointer",
        selected ? "bg-accent text-accent-foreground" : "hover:bg-muted"
      )}
      style={{ paddingLeft: level * 16 + 8 }}
      onClick={() => tree.select(node.id)}
    >
      {hasChildren && (
        <ChevronRight
          className={cn(
            "h-4 w-4 transition-transform",
            open && "rotate-90"
          )}
        />
      )}

      <span className="flex-1 truncate">
        {renderLabel ? renderLabel(node) : node.label}
      </span>

      {renderActions && (
        <span
          className="ml-2 flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {renderActions(node)}
        </span>
      )}
    </div>
  )

  if (!hasChildren) return row

  return (
    <Collapsible open={open} onOpenChange={() => tree.toggleExpand(node.id)}>
      <CollapsibleTrigger asChild>{row}</CollapsibleTrigger>
      <CollapsibleContent className="space-y-1">
        {node.children!.map((child) => (
          <TreeItem
            key={child.id}
            node={child}
            level={level + 1}
            tree={tree}
            renderActions={renderActions}
            renderLabel={renderLabel}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

/* =====================================================
 * 使用示例
 * =====================================================

<Tree
  data={data}
  defaultExpandedIds={["1"]}
  defaultSelectedId="1-1-2"
  renderActions={(node) => (
    <button className="text-xs text-muted-foreground">⋯</button>
  )}
/>

===================================================== */
