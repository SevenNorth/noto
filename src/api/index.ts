import {
  invoke
} from "@tauri-apps/api/core";

export const notesApi = {
  createNote: async (data) => {
    return await invoke("create_note", data);
  },
};