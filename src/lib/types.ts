export type Scope = 'project' | 'notes' | 'snippets';

export interface FlatNode {
  id: string
  parentId?: string | null
  name: string
  scope: Scope
  orderIndex?: number
}

export interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
}
