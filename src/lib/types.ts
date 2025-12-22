export const Scope = {
  PROJECTS: 'projects',
  NOTES: 'notes',
  SNIPPETS: 'snippets',
} as const;

export type Scope = (typeof Scope)[keyof typeof Scope];

export const NodeType = {
  FOLDER: 'folder',
  PROJECT: 'project',
  NOTE: 'note',
  SNIPPET: 'snippet',
} as const;

export type NodeType = (typeof NodeType)[keyof typeof NodeType];

export interface FlatNode {
  id: string
  parentId?: string | null
  name: string
  nodeType: NodeType
  scope: Scope
  orderIndex?: number
}

export interface TreeNode {
  id: string
  label: string
  nodeType: NodeType
  children?: TreeNode[]
}
