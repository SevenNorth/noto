import { invoke } from "@tauri-apps/api/core";
import { deepCamelToSnake, deepSnakeToCamel } from "@/lib/common";
import type { FlatNode, TreeNode as TreeResponseNode } from "@/lib/types";
import type { Scope } from "@/lib/types";
import { toast } from "sonner";

async function invokeCommand<TIn = any, TOut = any>(
  cmd: string,
  args?: TIn,
  options?: { camelizeResult?: boolean }
): Promise<TOut> {
  const opts = { camelizeResult: true, ...(options || {}) };
  try {
    const payload = args !== undefined ? (deepCamelToSnake(args) as any) : undefined;
    const res = await invoke(cmd, payload);
    if (opts.camelizeResult === false) return res as TOut;
    return deepSnakeToCamel(res) as TOut;
  } catch (err) {
    toast.error((err as Error)?.message ?? String(err));
    throw err;
  }
}

/* =========================
 * Notes
 * ========================= */
export interface CreateNoteParams {
  title: string;
  parentId?: string;
}

export const notesApi = {
  createNote: async (data: CreateNoteParams): Promise<void> => {
    return await invokeCommand<CreateNoteParams, void>("create_note", data);
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
    return await invokeCommand<{ scope?: Scope }, TreeResponseNode[]>("list_tree_nodes_tree", { scope });
  },

  createTreeNode: async (data: CreateTreeNodeParams): Promise<string> => {
    return await invokeCommand<CreateTreeNodeParams, string>("create_tree_node", data);
  },

  updateTreeNode: async (data: UpdateTreeNodeParams): Promise<void> => {
    return await invokeCommand<UpdateTreeNodeParams, void>("update_tree_node", data);
  },

  deleteTreeNode: async (nodeId: string): Promise<void> => {
    return await invokeCommand<{ nodeId: string }, void>("delete_tree_node", { nodeId });
  },

  listTreeNodes: async (scope?: Scope): Promise<FlatNode[]> => {
    return await invokeCommand<{ scope?: Scope }, FlatNode[]>("list_tree_nodes", { scope });
  },
};