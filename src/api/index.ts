import { invoke } from "@tauri-apps/api/core";
import { deepCamelToSnake, deepSnakeToCamel } from "@/lib/common";
import type { FlatNode, NodeType, TreeNode as TreeResponseNode } from "@/lib/types";
import type { Scope } from "@/lib/types";
import { toast } from "sonner";
import { create } from "domain";

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

export interface UpdateNoteTitleParams {
  noteId: string;
  title: string;
}

export interface NoteDetail {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface UpdateNoteContentParams {
  noteId: string;
  content: string;
}

export const notesApi = {
  createNote: async (data: CreateNoteParams): Promise<void> => {
    return await invokeCommand<CreateNoteParams, void>("create_note", data);
  },
  updateNoteTitle: async (data: UpdateNoteTitleParams): Promise<void> => {
    return await invokeCommand<UpdateNoteTitleParams, void>("update_note_title", data);
  },
  getNote: async (noteId: string): Promise<NoteDetail> => {
    return await invokeCommand<{ noteId: string }, NoteDetail>("get_note", { noteId });
  },
  updateNoteContent: async (data: UpdateNoteContentParams): Promise<void> => {
    return await invokeCommand<UpdateNoteContentParams, void>("update_note_content", data);
  },
};

/* =========================
 * Tree
 * ========================= */
export interface CreateTreeNodeParams {
  name: string;
  nodeType: NodeType;
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

export interface SnippetDetail {
  id: string;
  title: string;
  language?: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateSnippetParams {
  title: string;
  language?: string;
  content: string;
  parentId?: string;
}

export interface UpdateSnippetParams {
  snippetId: string;
  title: string;
  language?: string;
  content: string;
};

export const snippetApi = {
  createSnippet: async (data: CreateSnippetParams): Promise<void> => {
    return await invokeCommand<CreateSnippetParams, void>("create_snippet", data);
  },

  getSnippet: async (snippetId: string): Promise<SnippetDetail> => {
    return await invokeCommand<{ snippetId: string }, SnippetDetail>("get_snippet_detail", { snippetId });
  },

  updateSnippet: async (data: UpdateSnippetParams): Promise<void> => {
    return await invokeCommand<UpdateSnippetParams, void>("update_snippet_detail", data);
  },

  deleteSnippet: async (snippetId: string): Promise<void> => {
    return await invokeCommand<{ snippetId: string }, void>("delete_snippet_only", { snippetId });
  },
}
/* =========================
 * Tasks
 * ========================= */
export interface TaskDetail {
  id: string;
  nodeId: string;
  title: string;
  status: string;
  priority: number;
  dueDate?: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateTaskParams {
  nodeId: string;
  title: string;
  status?: string;
  priority?: number;
  dueDate?: number;
}

export interface UpdateTaskParams {
  taskId: string;
  title?: string;
  status?: string;
  priority?: number;
  dueDate?: number;
}

export const tasksApi = {
  listTasks: async (nodeId: string): Promise<TaskDetail[]> => {
    return await invokeCommand<{ nodeId: string }, TaskDetail[]>("list_tasks", { nodeId });
  },

  getTask: async (taskId: string): Promise<TaskDetail> => {
    return await invokeCommand<{ taskId: string }, TaskDetail>("get_task", { taskId });
  },

  createTask: async (data: CreateTaskParams): Promise<string> => {
    return await invokeCommand<CreateTaskParams, string>("create_task", data);
  },

  updateTask: async (data: UpdateTaskParams): Promise<void> => {
    return await invokeCommand<UpdateTaskParams, void>("update_task", data);
  },

  deleteTask: async (taskId: string): Promise<void> => {
    return await invokeCommand<{ taskId: string }, void>("delete_task", { taskId });
  },
};

/* time entries (work logs) */
export interface TimeEntry {
  id: string;
  taskId: string;
  workDate: number;
  duration: number;
  description: string;
  startTime?: number;
  endTime?: number;
  source: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateTimeEntryParams {
  taskId: string;
  workDate: number;
  duration: number;
  description: string;
  startTime?: number;
  endTime?: number;
  source?: string;
}

export const timeEntryApi = {
  list: async (taskId: string): Promise<TimeEntry[]> => {
    return await invokeCommand<{ taskId: string }, TimeEntry[]>("list_time_entries", { taskId });
  },
  create: async (data: CreateTimeEntryParams): Promise<string> => {
    return await invokeCommand<CreateTimeEntryParams, string>("create_time_entry", data);
  },
  delete: async (entryId: string): Promise<void> => {
    return await invokeCommand<{ entryId: string }, void>("delete_time_entry", { entryId });
  },
};