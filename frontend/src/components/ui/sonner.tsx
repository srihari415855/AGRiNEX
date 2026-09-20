"use client";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-stone-900 group-[.toaster]:border-stone-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl font-sans",
          description: "group-[.toast]:text-stone-500",
          actionButton:
            "group-[.toast]:bg-emerald-700 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-stone-100 group-[.toast]:text-stone-700",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
