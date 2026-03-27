"use client"

import * as React from "react"
import { Dialog } from "@base-ui/react/dialog"
import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"

function Modal({ ...props }: Dialog.Root.Props) {
  return <Dialog.Root {...props} />
}

function ModalClose({ ...props }: Dialog.Close.Props) {
  return <Dialog.Close {...props} />
}

function ModalContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: Dialog.Popup.Props & { showCloseButton?: boolean }) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop
        className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-sm"
      />
      <Dialog.Popup
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2",
          "max-h-[85dvh] overflow-y-auto rounded-2xl bg-popover text-popover-foreground shadow-2xl",
          "transition duration-200 ease-out",
          "data-starting-style:opacity-0 data-starting-style:scale-95",
          "data-ending-style:opacity-0 data-ending-style:scale-95",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <Dialog.Close
            render={
              <button className="absolute top-3 right-3 flex size-7 cursor-pointer items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" />
            }
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        )}
      </Dialog.Popup>
    </Dialog.Portal>
  )
}

function ModalTitle({ className, ...props }: Dialog.Title.Props) {
  return (
    <Dialog.Title
      className={cn("font-heading text-base font-medium text-foreground", className)}
      {...props}
    />
  )
}

export { Modal, ModalClose, ModalContent, ModalTitle }
