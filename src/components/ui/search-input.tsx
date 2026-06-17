import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ComponentType<{ className?: string }>;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, icon: Icon = Search, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-default-border bg-surface px-3 py-1.5 transition-colors focus-within:border-accent-blue/30",
          className
        )}
      >
        <Icon className="size-4 shrink-0 text-text-muted" />
        <input
          ref={ref}
          type="text"
          className="bg-transparent border-none text-xs text-text-primary focus:outline-none w-full placeholder:text-text-muted"
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
