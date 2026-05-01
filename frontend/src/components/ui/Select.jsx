import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../utils/cn";

export const Select = React.forwardRef(({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select an option",
  disabled = false,
  className,
  "aria-label": ariaLabel,
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        ref={ref}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg bg-surface-container-lowest px-4 py-2 text-sm text-on-surface ring-offset-background transition-colors focus:outline-none focus:ring-1 focus:ring-primary-dim focus:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50",
          isOpen ? "bg-surface-container-low ring-1 ring-primary-dim" : "",
          className
        )}
      >
        <span className={selectedOption ? "" : "text-on-surface-variant/50"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-surface-container-high py-1 shadow-ambient glass-panel ghost-border"
            role="listbox"
            aria-activedescendant={value ? `option-${value}` : undefined}
          >
            {options.map((option) => (
              <div
                key={option.value}
                id={`option-${option.value}`}
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-3 pr-9 text-sm outline-none hover:bg-primary/10 hover:text-primary transition-colors",
                  value === option.value ? "text-primary bg-primary/5" : "text-on-surface"
                )}
              >
                <span className="block truncate font-medium">{option.label}</span>
                {value === option.value && (
                  <span className="absolute right-3 flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Select.displayName = "Select";
