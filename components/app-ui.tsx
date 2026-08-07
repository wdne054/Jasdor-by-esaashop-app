"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function AppHeader({
  title,
  subtitle,
  left,
  right,
}: {
  title: string
  subtitle?: string
  left?: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <header className="bg-background/95 sticky top-0 z-30 px-4 pt-5 pb-3 backdrop-blur">
      <div className="flex items-center gap-3">
        {left}
        <div className="min-w-0 flex-1">
          <h1 className="font-serif truncate text-2xl leading-tight font-bold">{title}</h1>
          {subtitle ? <p className="text-muted-foreground truncate text-sm">{subtitle}</p> : null}
        </div>
        {right}
      </div>
    </header>
  )
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "bg-card border-border rounded-2xl border p-4 shadow-sm shadow-black/5",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Field({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label ? <span className="mb-1 block text-sm font-semibold">{label}</span> : null}
      <input
        {...props}
        className={cn(
          "bg-background border-border placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-ring/40 h-12 w-full rounded-xl border px-3 text-base outline-none focus-visible:ring-3",
          className,
        )}
      />
    </label>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  dismissible = true,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  dismissible?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose, dismissible])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center">
      <button
        type="button"
        aria-label="Tutup"
        tabIndex={dismissible ? 0 : -1}
        onClick={() => dismissible && onClose()}
        className="absolute inset-0 bg-black/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-card border-border relative w-full max-w-md rounded-3xl border p-5 shadow-lg"
      >
        <div className="mb-3 flex items-start gap-2">
          <h2 className="font-serif flex-1 text-xl leading-snug font-bold">{title}</h2>
          {dismissible ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="text-muted-foreground -mt-1 -mr-1 rounded-full p-2"
            >
              <X className="size-5" />
            </button>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  )
}

export function useToast() {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toast = useCallback((text: string) => {
    setMessage(text)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(null), 2200)
  }, [])

  useEffect(() => () => timer.current && clearTimeout(timer.current), [])

  const ToastView = message ? (
    <div
      role="status"
      className="bg-primary text-primary-foreground fixed inset-x-0 bottom-24 z-40 mx-auto w-fit max-w-[90%] rounded-full px-4 py-2 text-center text-sm font-semibold shadow-lg"
    >
      {message}
    </div>
  ) : null

  return { toast, ToastView }
}
