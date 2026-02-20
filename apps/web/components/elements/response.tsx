"use client";

import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        `
    size-full 
    [overflow-wrap:anywhere] 
    [word-break:break-word]

    [&>*:first-child]:mt-0 
    [&>*:last-child]:mb-0

    [&_p]:break-words
    [&_li]:break-words
    [&_a]:break-all

    [&_code]:whitespace-pre-wrap 
    [&_code]:break-words 
    [&_pre]:max-w-full 
    [&_pre]:overflow-x-auto

    /* TABLE — Dark Minimal Fixed */
    [&_table]:w-full
    [&_table]:max-w-full
    [&_table]:text-sm
    [&_table]:rounded-xl
    [&_table]:overflow-hidden
    [&_table]:bg-[#111827]   /* deep slate */
    [&_table]:border
    [&_table]:border-white/10
    [&_table]:shadow-md

    /* Scroll if smaller screen */
    [&_table]:block
    [&_table]:overflow-x-auto

    /* Header */
    [&_thead]:bg-[#1f2937]
    [&_th]:px-5
    [&_th]:py-3
    [&_th]:text-left
    [&_th]:font-medium
    [&_th]:text-gray-300
    [&_th]:border-b
    [&_th]:border-white/10

    /* Body rows */
    [&_tbody_tr]:border-b
    [&_tbody_tr]:border-white/5
    [&_tbody_tr:last-child]:border-0

    /* Cells */
    [&_td]:px-5
    [&_td]:py-4
    [&_td]:text-gray-200

    /* Hover */
    [&_tbody_tr:hover]:bg-white/5



    /* LIST FIXES */
    [&_ul]:list-disc
    [&_ul]:pl-6
    [&_ol]:list-decimal
    [&_ol]:pl-6
    [&_li]:marker:text-muted-foreground
    [&_li]:my-1

    /* Nested list spacing */
    [&_li>ul]:mt-1
    [&_li>ol]:mt-1
    `,
        className,
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

Response.displayName = "Response";
