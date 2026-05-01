import React from "react";
import { cn } from "../../utils/cn";

export const Badge = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    
    const variants = {
      default: "bg-surface-variant text-on-surface",
      primary: "bg-primary/10 text-primary",
      secondary: "bg-secondary/10 text-secondary",
      success: "bg-tertiary/10 text-tertiary",
      danger: "bg-error/10 text-error",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
