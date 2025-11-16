import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-600 active:scale-95 transform",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95 transform",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 active:scale-95 transform",
        outline: "text-foreground border-border bg-background hover:border-primary hover:bg-primary/10 hover:text-primary active:scale-95 transform",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
