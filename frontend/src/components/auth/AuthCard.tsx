import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AuthCardProps extends React.ComponentProps<typeof Card> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function AuthCard({ title, description, icon, children, className, ...props }: AuthCardProps) {
  return (
    <Card 
      className={cn(
        "border-border bg-card w-full shadow-sm max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out-quint",
        className
      )}
      {...props}
    >
      <CardHeader className="space-y-1.5 pb-4">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="p-2 rounded-lg bg-muted border border-border text-primary shrink-0 flex items-center justify-center">
              {icon}
            </div>
          )}
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </CardTitle>
        </div>
        {description && (
          <CardDescription className="text-sm text-muted-foreground leading-relaxed text-balance">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
export { CardFooter };
