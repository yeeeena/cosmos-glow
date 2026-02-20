import { Sparkles, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export interface ShotItem {
  id: string;
  label: string;
  reason: string;
}

export interface ShotsAnalysis {
  category: string;
  shots: ShotItem[];
}

interface AIRecommendationProps {
  selectedDetails: string[];
  onSelectedChange: (details: string[]) => void;
  shotsAnalysis?: ShotsAnalysis | null;
  isLoading?: boolean;
}

const FALLBACK_SHOTS: ShotItem[] = [
  { id: "front-shot", label: "정면 샷", reason: "기본 제품 컷" },
  { id: "side-shot", label: "측면 샷", reason: "제품 형태 강조" },
  { id: "closeup-shot", label: "클로즈업", reason: "디테일 강조" },
  { id: "top-shot", label: "탑뷰 샷", reason: "전체 구성 파악" },
];

export function AIRecommendation({
  selectedDetails,
  onSelectedChange,
  shotsAnalysis,
  isLoading = false,
}: AIRecommendationProps) {
  const toggleDetail = (id: string) => {
    if (selectedDetails.includes(id)) {
      onSelectedChange(selectedDetails.filter((d) => d !== id));
    } else {
      onSelectedChange([...selectedDetails, id]);
    }
  };

  const shots = shotsAnalysis?.shots ?? FALLBACK_SHOTS;
  const category = shotsAnalysis?.category ?? null;

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-primary">AI가 이 제품을 분석했어요</span>
        {isLoading && <Loader2 className="h-3 w-3 text-primary animate-spin ml-auto" />}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground animate-pulse">제품 카테고리 파악 중...</p>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {category && (
            <p className="text-xs text-muted-foreground">
              제품 카테고리: <span className="text-foreground font-medium">{category}</span>
            </p>
          )}
          <div className="space-y-2">
            {shots.map((shot) => (
              <button
                key={shot.id}
                onClick={() => toggleDetail(shot.id)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 transition-colors text-left"
              >
                <Checkbox
                  checked={selectedDetails.includes(shot.id)}
                  onCheckedChange={() => toggleDetail(shot.id)}
                  className="shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{shot.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{shot.reason}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
