"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-white/10 bg-[#0b1628]/90 p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl md:w-full backdrop-blur-xl ring-1 ring-white/5",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4 text-white" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionLabel?: string;
  cancelLabel?: string;
  onAction: () => void;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel = "Confirm",
  cancelLabel = "Cancel",
  onAction,
  variant = "danger",
  isLoading = false,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-arche-gold/10 blur-[50px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className={cn(
            "p-4 rounded-full mb-2 ring-1 inset-shadow",
             variant === "danger" ? "bg-red-500/10 ring-red-500/20 text-red-400" :
             variant === "warning" ? "bg-amber-500/10 ring-amber-500/20 text-amber-400" :
             "bg-blue-500/10 ring-blue-500/20 text-blue-400"
          )}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <DialogPrimitive.Title asChild>
                <h3 className="text-xl font-semibold text-white tracking-tight">
                {title}
                </h3>
            </DialogPrimitive.Title>
            <DialogPrimitive.Description asChild>
                <p className="text-sm text-white/60 leading-relaxed px-4">
                {description}
                </p>
            </DialogPrimitive.Description>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <DialogClose asChild>
            <button className="px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors ring-1 ring-white/5">
              {cancelLabel}
            </button>
          </DialogClose>
          <button
            onClick={onAction}
            disabled={isLoading}
            className={cn(
              "px-4 py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg",
              variant === "danger" 
                ? "bg-red-500/80 hover:bg-red-500 shadow-red-900/20" 
                : "bg-arche-gold text-slate-900 hover:bg-white shadow-arche-gold/20",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {actionLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
