import { NodeType as NodeTypeConst } from "@/lib/types";
import type { FlatNode, TreeNode, NodeType, ResourceType } from "@/lib/types";

/**
 * Build nested tree from flat nodes. Returns roots array.
 * - nodes: flat array with id, parentId, name, orderIndex
 */
export function buildTree(nodes: FlatNode[]): TreeNode[] {
  const meta = new Map<
    string,
    {
      parent?: string | null
      name: string
      nodeType: NodeType
      order: number
      resourceId?: string | null
      resourceType?: ResourceType | null
    }
  >()
  for (const n of nodes) {
    meta.set(n.id, {
      parent: n.parentId ?? null,
      name: n.name,
      nodeType: n.nodeType,
      order: n.orderIndex ?? 0,
      resourceId: n.resourceId ?? null,
      resourceType: n.resourceType ?? null,
    })
  }

  const childrenMap = new Map<string | null, string[]>()
  for (const n of nodes) {
    const parent = n.parentId ?? null
    const arr = childrenMap.get(parent) ?? []
    arr.push(n.id)
    childrenMap.set(parent, arr)
  }

  // sort children by order
  childrenMap.forEach((arr) => {
    arr.sort((a, b) => (meta.get(a)?.order ?? 0) - (meta.get(b)?.order ?? 0))
  })

  const built = new Map<string, TreeNode>()
  const visiting = new Set<string>()

  function buildNode(id: string): TreeNode {
    if (built.has(id)) return built.get(id) as TreeNode
    if (visiting.has(id)) {
      // cycle detected: return node without children
      const m = meta.get(id)
      const node: TreeNode = {
        id,
        label: m?.name ?? id,
        nodeType: m?.nodeType ?? NodeTypeConst.FOLDER,
        resourceId: m?.resourceId ?? null,
        resourceType: m?.resourceType ?? null,
      }
      built.set(id, node)
      return node
    }
    visiting.add(id)
    const m = meta.get(id)
    const childIds = childrenMap.get(id) ?? []
    const children: TreeNode[] = []
    for (const cid of childIds) {
      children.push(buildNode(cid))
    }
    visiting.delete(id)

    const node: TreeNode = {
      id,
      label: m?.name ?? id,
      nodeType: m?.nodeType ?? NodeTypeConst.FOLDER,
      resourceId: m?.resourceId ?? null,
      resourceType: m?.resourceType ?? null,
    }
    if (children.length) node.children = children
    built.set(id, node)
    return node
  }

  // roots
  const roots: TreeNode[] = []
  const rootIds = childrenMap.get(null)
  if (rootIds && rootIds.length) {
    for (const rid of rootIds) roots.push(buildNode(rid))
  } else {
    // fallback: nodes with no parent or parent not found
    const candidates = [] as string[]
    meta.forEach((m, id) => {
      if (!m.parent || !meta.has(m.parent)) candidates.push(id)
    })
    candidates.sort((a, b) => (meta.get(a)?.order ?? 0) - (meta.get(b)?.order ?? 0))
    for (const cid of candidates) roots.push(buildNode(cid))
  }

  return roots
}

/**
 * 深度优先查找树节点
 */
export function findNodeById(nodes: TreeNode[], id: string): TreeNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const found = findNodeById(n.children, id)
      if (found) return found
    }
  }
  return undefined
}
