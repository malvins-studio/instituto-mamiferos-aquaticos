import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-base text-brand-text-primary placeholder:text-brand-text-secondary transition-all duration-200 outline-none",
        "focus-visible:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
        "aria-invalid:border-brand-status-error aria-invalid:ring-brand-status-error/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
