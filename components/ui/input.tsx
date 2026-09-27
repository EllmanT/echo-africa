import * as React from "react";

import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-black/[0.12] bg-white px-4 text-base text-foreground shadow-[0_1px_0_rgba(20,20,40,0.03)] " +
  "placeholder:text-neutral-400 transition-[border-color,box-shadow] duration-150 " +
  "focus-visible:border-purple focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple/15 " +
  "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/10 disabled:cursor-not-allowed disabled:opacity-50";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, type, ...props }, ref) => (
  <input type={type} ref={ref} className={cn(fieldBase, "h-12", className)} {...props} />
));
Input.displayName = "Input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, "min-h-[7rem] resize-y py-3 leading-relaxed", className)} {...props} />
));
Textarea.displayName = "Textarea";

export { Input, Textarea };
