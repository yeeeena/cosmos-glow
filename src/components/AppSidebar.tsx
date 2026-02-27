import { Home, Sparkles } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function AppSidebar() {
  return (
    <div className="flex flex-col items-center w-[60px] h-screen border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] py-3 gap-1 shrink-0">

      {/* Logo — Align UI: 정밀한 radius, inner glow */}
      <div className="flex items-center justify-center w-10 h-10 mb-3">
        <div className="w-8 h-8 rounded-[10px] bg-primary flex items-center justify-center shadow-[0_0_16px_rgba(27,98,255,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]">
          <Sparkles className="h-4 w-4 text-white" strokeWidth={2} />
        </div>
      </div>

      {/* Divider — Align UI: subtle separator */}
      <div className="w-7 h-px bg-[hsl(var(--sidebar-border))] mb-1" />

      {/* Nav */}
      <nav className="flex flex-col items-center gap-0.5 flex-1 w-full px-2">
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <NavLink
              to="/"
              end
              className="flex items-center justify-center w-full h-9 rounded-[10px] transition-all duration-150 text-[hsl(var(--sidebar-foreground))] hover:text-foreground hover:bg-[hsl(var(--sidebar-accent))]"
              activeClassName="text-primary bg-primary/10 shadow-[inset_0_0_0_1px_rgba(27,98,255,0.2)]"
            >
              <Home className="h-4 w-4" strokeWidth={1.75} />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={10}
            className="text-label-sm bg-[hsl(var(--popover))] border border-[hsl(var(--border-strong))] shadow-[var(--shadow-md)]"
          >
            홈
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <NavLink
              to="/create"
              className="flex items-center justify-center w-full h-9 rounded-[10px] transition-all duration-150 text-[hsl(var(--sidebar-foreground))] hover:text-foreground hover:bg-[hsl(var(--sidebar-accent))]"
              activeClassName="text-primary bg-primary/10 shadow-[inset_0_0_0_1px_rgba(27,98,255,0.2)]"
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={10}
            className="text-label-sm bg-[hsl(var(--popover))] border border-[hsl(var(--border-strong))] shadow-[var(--shadow-md)]"
          >
            컨셉샷 생성
          </TooltipContent>
        </Tooltip>
      </nav>

      {/* Bottom — version indicator */}
      <div className="w-7 h-px bg-[hsl(var(--sidebar-border))] mb-2" />
      <span className="text-[9px] font-semibold text-[hsl(var(--sidebar-foreground))/0.35] tracking-widest uppercase">v1</span>
    </div>
  );
}
