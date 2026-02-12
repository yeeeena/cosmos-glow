import { Home, Sparkles, ImagePlus } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function AppSidebar() {
  return (
    <div className="flex flex-col items-center w-16 h-screen border-r border-border bg-sidebar py-4 gap-1 shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-center w-10 h-10 mb-4">
        <span className="text-xl">🧪</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <NavLink
              to="/"
              end
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent"
              activeClassName="text-primary bg-primary/10"
            >
              <Home className="h-5 w-5" />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            <p>홈</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <NavLink
              to="/create"
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent"
              activeClassName="text-primary bg-primary/10"
            >
              <ImagePlus className="h-5 w-5" />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            <p>컨셉샷 생성</p>
          </TooltipContent>
        </Tooltip>
      </nav>

      {/* Bottom accent */}
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
        <Sparkles className="h-5 w-5" />
      </div>
    </div>
  );
}
