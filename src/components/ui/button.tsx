import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Align UI base: 정밀한 radius, 부드러운 트랜지션, 선명한 포커스
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        // Align UI: filled — 진한 primary, 미묘한 inner shadow
        default:
          "rounded-[10px] bg-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-[hsl(222,100%,60%)] active:bg-[hsl(222,100%,47%)] active:shadow-none",

        // Align UI Fancy Button Primary
        // before: 상단→하단 white 12% 그라디언트 테두리 마스크
        // after:  흰 광택 오버레이 (16% → hover 24%)
        // shadow: 외부 파란 glow + 하단 어두운 그림자
        fancy:
          "relative rounded-[10px] bg-primary text-white overflow-hidden " +
          "shadow-[0_0_0_1px_rgba(27,98,255,0.9),0_1px_3px_rgba(0,0,0,0.4)] " +
          "before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none " +
          "before:bg-gradient-to-b before:from-white/[.16] before:to-transparent " +
          "after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none " +
          "after:bg-gradient-to-b after:from-white/[.10] after:to-transparent after:opacity-100 " +
          "hover:shadow-[0_0_0_1px_rgba(27,98,255,0.9),0_1px_3px_rgba(0,0,0,0.4)] " +
          "hover:bg-[hsl(222,100%,60%)] " +
          "active:bg-[hsl(222,100%,47%)] active:shadow-[0_0_0_1px_rgba(27,98,255,0.7)] " +
          "transition-all duration-200",

        // Align UI: filled + glow 효과
        glow:
          "rounded-[10px] bg-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_20px_rgba(27,98,255,0.3)] hover:bg-[hsl(222,100%,60%)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_28px_rgba(27,98,255,0.45)] active:bg-[hsl(222,100%,47%)] active:shadow-none",

        // Align UI: stroke — 테두리만, 배경 없음
        stroke:
          "rounded-[10px] border border-[hsl(var(--border-strong))] bg-transparent text-foreground hover:border-[hsl(var(--muted-foreground))/0.5] hover:bg-[hsl(var(--accent))] active:bg-[hsl(var(--muted))]",

        // Align UI: lighter — primary 색상의 반투명 배경
        lighter:
          "rounded-[10px] bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 hover:border-primary/30 active:bg-primary/20",

        // Align UI: ghost — 완전히 투명, hover에만 배경
        ghost:
          "rounded-[10px] bg-transparent text-muted-foreground hover:bg-[hsl(var(--accent))] hover:text-foreground active:bg-[hsl(var(--muted))]",

        // destructive
        destructive:
          "rounded-[10px] bg-destructive text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-destructive/90 active:bg-destructive/80",

        // outline (기존 호환)
        outline:
          "rounded-[10px] border border-[hsl(var(--border-strong))] bg-transparent text-foreground hover:bg-[hsl(var(--accent))] hover:text-accent-foreground",

        // secondary
        secondary:
          "rounded-[10px] bg-[hsl(var(--secondary))] text-secondary-foreground hover:bg-[hsl(var(--accent))]",

        // link
        link: "text-primary underline-offset-4 hover:underline rounded-none",

        // Align UI: Compact Button (icon-only, 24px)
        // stroke: 테두리 + 배경 subtle, hover 시 bg 강화
        compact:
          "h-6 w-6 rounded-[6px] border border-white/20 bg-white/10 text-white " +
          "shadow-[0_1px_2px_rgba(0,0,0,0.2)] " +
          "hover:bg-white/20 hover:border-white/30 hover:shadow-[0_1px_4px_rgba(0,0,0,0.3)] " +
          "active:bg-white/[.08] active:shadow-none " +
          "transition-all duration-150 [&_svg]:size-[14px]",
      },
      size: {
        xs:      "h-7 px-2.5 text-xs rounded-[8px]",
        sm:      "h-8 px-3 text-xs rounded-[9px]",
        default: "h-9 px-4",
        md:      "h-10 px-4",
        lg:      "h-11 px-6 text-base",
        icon:    "h-9 w-9 rounded-[10px]",
        "icon-sm": "h-7 w-7 rounded-[8px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
