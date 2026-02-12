import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, Users, FolderOpen, TrendingUp } from "lucide-react";

const stats = [
  { label: "총 프로젝트", value: "24", icon: FolderOpen, change: "+3" },
  { label: "활성 사용자", value: "1,280", icon: Users, change: "+12%" },
  { label: "전환율", value: "3.2%", icon: TrendingUp, change: "+0.4%" },
  { label: "총 수익", value: "₩4,200만", icon: BarChart3, change: "+8%" },
];

const Index = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">대시보드</h1>
            <p className="text-sm text-muted-foreground mt-1">프로젝트 현황을 한눈에 확인하세요.</p>
          </div>
          <Button variant="glow">새 프로젝트</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-5 bg-card border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-label">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <span className="text-xs text-primary mt-1 inline-block">{stat.change}</span>
            </Card>
          ))}
        </div>

        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-bold mb-2">최근 활동</h2>
          <p className="text-sm text-muted-foreground">아직 표시할 활동이 없습니다.</p>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Index;
