import { invoke } from "@tauri-apps/api/core";
import { deepCamelToSnake, deepSnakeToCamel } from "@/lib/common";
import type { FlatNode, TreeNode as TreeResponseNode } from "@/lib/types";
import type { Scope } from "@/lib/types";

/* =========================
 * Notes
 * ========================= */
export interface CreateNoteParams {
  title: string;
  parentId?: string;
}

export const notesApi = {
  createNote: async (data: CreateNoteParams): Promise<void> => {
    const args = deepCamelToSnake(data) as any;
    return await invoke("create_note", args);
  },
};

/* =========================
 * Tree
 * ========================= */
export interface CreateTreeNodeParams {
  name: string;
  scope: Scope;
  parentId?: string | null;
  orderIndex?: number;
}

export interface UpdateTreeNodeParams {
  nodeId: string;
  name: string;
  parentId?: string | null;
  orderIndex?: number;
}

export const treeApi = {
  getTree: async (scope?: Scope): Promise<TreeResponseNode[]> => {
    const args = deepCamelToSnake({ scope }) as any;
    const res = await invoke("list_tree_nodes_tree", args);
    return deepSnakeToCamel(res) as TreeResponseNode[];
  },

  createTreeNode: async (data: CreateTreeNodeParams): Promise<string> => {
    const args = deepCamelToSnake(data) as any;
    const res = await invoke("create_tree_node", args);
    return res as string;
  },

  updateTreeNode: async (data: UpdateTreeNodeParams): Promise<void> => {
    const args = deepCamelToSnake(data) as any;
    await invoke("update_tree_node", args);
  },

  deleteTreeNode: async (nodeId: string): Promise<void> => {
    const args = deepCamelToSnake({ nodeId }) as any;
    await invoke("delete_tree_node", args);
  },

  listTreeNodes: async (scope?: Scope): Promise<FlatNode[]> => {
    const args = deepCamelToSnake({ scope }) as any;
    const res = await invoke("list_tree_nodes", args);
    return deepSnakeToCamel(res) as FlatNode[];
  },
};