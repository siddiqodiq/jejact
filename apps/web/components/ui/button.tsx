import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover active:scale-[0.98] elevated",
  secondary:
    "bg-surface text-ink border border-hairline hover:border-ink-faint active:scale-[0.98]",
  ghost: "text-ink-secondary hover:text-ink hover:bg-accent-soft/50",
  danger:
    "bg-transparent text-red-500 border border-hairline hover:bg-red-500/10 active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-sm rounded-full",
  md: "h-11 px-5 text-[15px] rounded-full",
  lg: "h-13 px-7 text-base rounded-full",
};

type ButtonProps<T extends ElementType> = {
  as?: T;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
} & ComponentPropsWithoutRef<T>;

export function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps<T>) {
  const Component = (as ?? "button") as ElementType;
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
