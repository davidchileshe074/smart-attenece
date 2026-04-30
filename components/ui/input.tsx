import * as React from "react";
import { LucideIcon } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon: Icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-semibold text-text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            className={`
              flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm 
              transition-all placeholder:text-slate-400 
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/10 
              disabled:cursor-not-allowed disabled:opacity-50
              ${Icon ? 'pl-10' : ''}
              ${error ? 'border-error ring-error/10' : 'border-slate-200'}
              ${className}
            `}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[11px] font-bold text-error uppercase tracking-tighter">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
