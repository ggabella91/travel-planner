"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-sm" />
        <AlertDialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl bg-popover p-6 text-popover-foreground shadow-2xl",
            "transition duration-200 ease-out",
            "data-starting-style:opacity-0 data-starting-style:scale-95",
            "data-ending-style:opacity-0 data-ending-style:scale-95"
          )}
        >
          <AlertDialog.Title className="text-base font-semibold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
            {description}
          </AlertDialog.Description>
          <div className="mt-5 flex gap-3">
            <AlertDialog.Close
              render={
                <Button variant="outline" className="flex-1" disabled={loading} />
              }
            >
              Cancel
            </AlertDialog.Close>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Deleting…" : confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
