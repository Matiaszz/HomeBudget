import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormFieldProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
  id: string;
}

export function FormField({ label, error, id, className, ...props }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5 flex flex-col items-start w-full group", className)}>
      <Label 
        htmlFor={id} 
        className={cn(
          "text-xs font-semibold tracking-wide text-foreground/80 transition-colors group-focus-within:text-foreground", 
          error && "text-destructive"
        )}
      >
        {label}
      </Label>
      <Input
        id={id}
        aria-invalid={!!error}
        className={cn(
          "w-full transition-all duration-200 border-border focus-visible:border-primary/40 focus-visible:ring-primary/20",
          error && "border-destructive/60 focus-visible:border-destructive/60 focus-visible:ring-destructive/20"
        )}
        {...props}
      />
      {error && (
        <span className="text-xs text-destructive mt-1 font-medium leading-none animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </span>
      )}
    </div>
  )
}
