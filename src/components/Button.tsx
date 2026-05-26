import type { ButtonHTMLAttributes } from "react";
import { cn } from "../utils/classNames";

type ButtonVariant = "primary" | "secondary" | "ghost" | "warning" | "danger";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700 focus-visible:outline-indigo-600",
  secondary:
    "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 focus-visible:outline-slate-500",
  ghost:
    "border-transparent bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:outline-slate-500",
  warning:
    "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 focus-visible:outline-amber-500",
  danger:
    "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 focus-visible:outline-rose-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-10 px-4 text-sm",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg border font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
