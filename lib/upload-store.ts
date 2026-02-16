import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UploadedFileEntry = {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  status: "success" | "failed";
};

type UploadStoreState = {
  files: UploadedFileEntry[];
  addBatch: (files: { name: string; size: number; success: boolean }[]) => void;
  removeFile: (id: string) => void;
  clear: () => void;
};

export const useUploadStore = create<UploadStoreState>()(
  persist(
    (set) => ({
      files: [],
      addBatch: (batch) =>
        set((state) => ({
          files: [
            ...batch.map((f) => ({
              id: `${Date.now()}-${f.name}`,
              name: f.name,
              size: f.size,
              uploadedAt: new Date().toISOString(),
              status: (f.success ? "success" : "failed") as "success" | "failed",
            })),
            ...state.files,
          ].slice(0, 100),
        })),
      removeFile: (id) =>
        set((state) => ({
          files: state.files.filter((f) => f.id !== id),
        })),
      clear: () => set({ files: [] }),
    }),
    {
      name: "first-family-upload-history",
    },
  ),
);

