"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

import { markRouteNavigating } from "@/components/navigation-loader";
import { isSameAppRoute } from "@/lib/navigation-route-key";

type Props = ComponentProps<typeof Link>;

function isModifiedClick(e: MouseEvent<HTMLAnchorElement>) {
  return (
    e.button !== 0 ||
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey
  );
}

/** Internal link that paints the navigation overlay before `router.push`. */
export function NavigatingLink({ href, onClick, ...rest }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || isModifiedClick(e)) return;

        if (
          isSameAppRoute(href, pathname, searchParams, window.location.origin)
        ) {
          return;
        }

        e.preventDefault();
        markRouteNavigating();
        router.push(typeof href === "string" ? href : (href.pathname ?? "/"));
      }}
    />
  );
}
