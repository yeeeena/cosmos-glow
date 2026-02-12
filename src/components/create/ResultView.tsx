import { Download, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultViewProps {
  isGenerating: boolean;
  onRestart: () => void;
}

const MOCK_RESULTS = [
  { id: "main", label: "메인 컨셉샷", isMain: true },
  { id: "detail-1", label: "상세컷 1" },
  { id: "detail-2", label: "상세컷 2" },
  { id: "detail-3", label: "상세컷 3" },
];

export function ResultView({ isGenerating, onRestart }: ResultViewProps) {
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-6">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-semibold">컨셉샷 생성 중...</p>
          <p className="text-sm text-muted-foreground">약 30초 정도 소요됩니다</p>
        </div>
        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">생성 완료! 🎉</h2>
        <p className="text-muted-foreground text-sm">컨셉샷이 준비되었습니다</p>
      </div>

      {/* Main concept shot */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="relative group">
          <div className="aspect-[16/10] rounded-xl border border-border bg-card flex items-center justify-center">
            <p className="text-muted-foreground text-sm">메인 컨셉샷 미리보기</p>
          </div>
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="h-8 w-8 rounded-lg bg-background/80 backdrop-blur flex items-center justify-center hover:bg-accent">
              <Download className="h-4 w-4" />
            </button>
            <button className="h-8 w-8 rounded-lg bg-background/80 backdrop-blur flex items-center justify-center hover:bg-accent">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail shots grid */}
      <div className="max-w-2xl mx-auto w-full grid grid-cols-3 gap-3">
        {MOCK_RESULTS.filter((r) => !r.isMain).map((result) => (
          <div key={result.id} className="relative group">
            <div className="aspect-square rounded-xl border border-border bg-card flex items-center justify-center">
              <p className="text-muted-foreground text-xs text-center px-2">{result.label}</p>
            </div>
            <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="h-6 w-6 rounded-md bg-background/80 backdrop-blur flex items-center justify-center hover:bg-accent">
                <Download className="h-3 w-3" />
              </button>
              <button className="h-6 w-6 rounded-md bg-background/80 backdrop-blur flex items-center justify-center hover:bg-accent">
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" onClick={onRestart}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          새로 만들기
        </Button>
        <Button variant="glow" className="px-6">
          <Download className="h-4 w-4 mr-2" />
          ZIP 다운로드
        </Button>
      </div>
    </div>
  );
}
