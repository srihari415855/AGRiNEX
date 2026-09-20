"use client";
import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams as useNextSearchParams, useParams as useNextParams, usePathname } from "next/navigation";

export function useNavigate() {
  const router = useRouter();
  return (to: string | number) => {
    if (typeof to === "number") {
      if (typeof window !== "undefined") {
        if (to === -1) window.history.back();
        else window.history.go(to);
      }
    } else {
      router.push(to);
    }
  };
}

export function useSearchParams(): [URLSearchParams, (p: any) => void] {
  const sp = useNextSearchParams();
  const searchParams = typeof window !== "undefined" 
    ? new URLSearchParams(window.location.search) 
    : new URLSearchParams(sp ? sp.toString() : "");
  return [searchParams, () => {}];
}

export function useParams(): Record<string, string> {
  const p = useNextParams();
  return (p || {}) as Record<string, string>;
}

export function NavLink({
  to,
  children,
  className,
  end = false,
  onClick,
  "data-testid": testId,
}: {
  to: string;
  children: React.ReactNode;
  className?: string | (({ isActive }: { isActive: boolean }) => string);
  end?: boolean;
  onClick?: () => void;
  "data-testid"?: string;
}) {
  const pathname = usePathname();
  const isActive = end ? pathname === to : pathname === to || (to !== "/app" && pathname?.startsWith(to));
  const resolvedClass = typeof className === "function" ? className({ isActive }) : className;

  return (
    <Link href={to} className={resolvedClass} onClick={onClick} data-testid={testId}>
      {children}
    </Link>
  );
}
