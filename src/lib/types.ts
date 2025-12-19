export const Scope = {
  PROJECT: 'project',
  NOTES: 'notes',
  SNIPPETS: 'snippets',
} as const;

export type Scope = (typeof Scope)[keyof typeof Scope];

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
