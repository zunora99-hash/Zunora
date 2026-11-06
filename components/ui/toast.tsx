"use client";

import { create } from "zustand";
import { X } from "lucide-react";

type Toast = { id: string; title: string; description?: string };

const useToastStore = create<{
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
}>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    window.setTimeout(() => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })), 3500);
  },
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }))
}));

export function toast(toast: Omit<Toast, "id">) {
  useToastStore.getState().push(toast);
}

export function Toaster() {
  const { toasts, remove } = useToastStore();
  return (
    <div className="fixed right-4 top-4 z-[80] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
      {toasts.map((item) => (
        <div key={item.id} className="rounded-lg border bg-background p-4 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              {item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
            </div>
            <button aria-label="Dismiss notification" onClick={() => remove(item.id)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
