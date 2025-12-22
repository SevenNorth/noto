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

export const ResourceType = {
  NOTE: 'note',
  SNIPPET: 'snippet',
} as const;

export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];

export interface FlatNode {
  id: string
  parentId?: string | null
  name: string
  nodeType: NodeType
  scope: Scope
  orderIndex?: number
  resourceId?: string | null
  resourceType?: ResourceType | null
}

export interface TreeNode {
  id: string
  label: string
  nodeType: NodeType
  resourceId?: string | null
  resourceType?: ResourceType | null
  children?: TreeNode[]
}
