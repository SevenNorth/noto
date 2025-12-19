"use client"

import * as React from "react"
import type { TreeNode } from "@/lib/types"

/* =====================================================
 * Headless Tree —— Types
 * ===================================================== */

export interface useTreeProps {
  /** 数据 */
  data: TreeNode[]

  /** -------- 展开态（双模式）-------- */
  expandedIds?: string[]
  defaultExpandedIds?: string[]
  onExpandedChange?: (ids: string[]) => void

  /** -------- 选中态（双模式）-------- */
  selectedId?: string
  defaultSelectedId?: string
  onSelectedChange?: (id: string | undefined) => void
}

/* =====================================================
 * 通用 Controllable State
 * ===================================================== */

function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (v: T) => void
): [T, (v: T) => void] {
  const [inner, setInner] = React.useState(defaultValue)
  const isControlled = controlled !== undefined

  const value = isControlled ? controlled : inner

  const setValue = React.useCallback(
    (v: T) => {
      if (!isControlled) setInner(v)
      onChange?.(v)
    },
    [isControlled, onChange]
  )

  return [value, setValue]
}

/* =====================================================
 * useTree —— Headless 核心
 * ===================================================== */

export function useTree(props: useTreeProps) {
  const {
    data,
    expandedIds,
    defaultExpandedIds = [],
    onExpandedChange,
    selectedId,
    defaultSelectedId,
    onSelectedChange,
  } = props

  const [currentExpandedIds, setExpandedIds] = useControllableState(
    expandedIds,
    defaultExpandedIds,
    onExpandedChange
  )

  const [currentSelectedId, setSelectedId] = useControllableState<
    string | undefined
  >(selectedId, defaultSelectedId, onSelectedChange)

  /** ---------- 行为 ---------- */

  const toggleExpand = React.useCallback(
    (id: string) => {
      setExpandedIds(
        currentExpandedIds.includes(id)
          ? currentExpandedIds.filter((i) => i !== id)
          : [...currentExpandedIds, id]
      )
    },
    [currentExpandedIds, setExpandedIds]
  )

  const select = React.useCallback(
    (id: string) => {
      setSelectedId(id)
    },
    [setSelectedId]
  )

  /** ---------- 工具 ---------- */

  const isExpanded = React.useCallback(
    (id: string) => currentExpandedIds.includes(id),
    [currentExpandedIds]
  )

  const isSelected = React.useCallback(
    (id: string) => currentSelectedId === id,
    [currentSelectedId]
  )

  return {
    /** state */
    data,
    expandedIds: currentExpandedIds,
    selectedId: currentSelectedId,

    /** actions */
    setExpandedIds,
    toggleExpand,
    select,
    setSelectedId,

    /** utils */
    isExpanded,
    isSelected,
  }
}

/* =====================================================
 * 示例：Headless 用法（无任何 UI 约束）
 * =====================================================

const tree = useTree({
  data,
  defaultExpandedIds: ["1"],
})

function render(nodes: TreeNode[], level = 0) {
  return nodes.map((node) => (
    <div key={node.id} style={{ paddingLeft: level * 16 }}>
      <div onClick={() => tree.select(node.id)}>
        {node.label}
      </div>

      {node.children && tree.isExpanded(node.id) &&
        render(node.children, level + 1)}
    </div>
  ))
}

render(tree.data)

===================================================== */
