import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'glass';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-white border border-slate-200 shadow-sm",
      outline: "bg-transparent border border-slate-200",
      glass: "bg-white/70 backdrop-blur-md border border-white/20 shadow-sm",
    };

    return (
      <div
        ref={ref}
        className={`rounded-md p-6 ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";
