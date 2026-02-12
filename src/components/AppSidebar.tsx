import { Home, Eye, Sparkles, GitBranch, Settings, Square, HelpCircle, LayoutGrid } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const topMenuItems = [
  { title: "홈", url: "/", icon: Home },
  { title: "갤러리", url: "/gallery", icon: Eye },
  { title: "생성", url: "/", icon: Sparkles, active: true },
  { title: "히스토리", url: "/history", icon: GitBranch },
  { title: "설정", url: "/settings", icon: Settings },
  { title: "템플릿", url: "/templates", icon: Square },
];

const bottomMenuItems = [
  { title: "도움말", url: "/help", icon: HelpCircle },
  { title: "대시보드", url: "/dashboard", icon: LayoutGrid },
];

function SidebarIcon({ item, isActive }: { item: typeof topMenuItems[0]; isActive?: boolean }) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <NavLink
          to={item.url}
          end={item.url === "/"}
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent ${isActive ? "text-primary bg-primary/10" : ""}`}
          activeClassName="text-primary bg-primary/10"
        >
          <item.icon className="h-5 w-5" />
        </NavLink>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        <p>{item.title}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar() {
  return (
    <div className="flex flex-col items-center w-16 h-screen border-r border-border bg-sidebar py-4 gap-1 shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-center w-10 h-10 mb-4">
        <span className="text-xl">🧪</span>
      </div>

      {/* Top nav */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {topMenuItems.map((item) => (
          <SidebarIcon key={item.title} item={item} />
        ))}
      </nav>

      {/* Bottom nav */}
      <nav className="flex flex-col items-center gap-1">
        {bottomMenuItems.map((item) => (
          <SidebarIcon key={item.title} item={item} />
        ))}
        {/* Active indicator - sparkles */}
        <div className="mt-2 flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
      </nav>
    </div>
  );
}
