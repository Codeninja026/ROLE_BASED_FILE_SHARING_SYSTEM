import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export const Button = React.forwardRef(
  ({ className, variant = "primary", size = "default", children, ...props }, ref) => {
    
    const variants = {
      primary: "bg-gradient-to-r from-primary to-secondary text-surface-container-highest font-medium glow-primary-hover border-transparent",
      secondary: "bg-transparent text-on-surface ghost-border hover:bg-surface-variant/30",
      danger: "bg-error/10 text-error ghost-border hover:bg-error/20",
      ghost: "bg-transparent text-on-surface hover:bg-surface-container",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8 text-lg",
      icon: "h-10 w-10 shrink-0",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
