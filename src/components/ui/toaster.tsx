"use client";

import { Toast } from "@base-ui/react/toast";
import { toastManager } from "@/lib/toast";
import { XIcon } from "lucide-react";

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return (
    <>
      {toasts.map((t) => (
        <Toast.Root
          key={t.id}
          toast={t}
          className={`flex w-72 items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200 data-ending-style:translate-x-4 data-ending-style:opacity-0 data-starting-style:translate-x-4 data-starting-style:opacity-0 ${
            t.type === "error"
              ? "border-destructive/20 bg-destructive/10 text-destructive"
              : "border-border bg-popover text-popover-foreground"
          }`}
        >
          <Toast.Title className="flex-1 pt-px text-sm font-medium leading-snug" />
          <Toast.Close className="mt-px cursor-pointer rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100">
            <XIcon className="size-3.5" />
            <span className="sr-only">Dismiss</span>
          </Toast.Close>
        </Toast.Root>
      ))}
    </>
  );
}

export function Toaster() {
  return (
    <Toast.Provider toastManager={toastManager}>
      <Toast.Viewport className="fixed right-4 z-50 flex flex-col gap-2 [bottom:calc(5.5rem+env(safe-area-inset-bottom))]">
        <ToastList />
      </Toast.Viewport>
    </Toast.Provider>
  );
}
