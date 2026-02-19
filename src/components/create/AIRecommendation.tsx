import { Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const MOCK_AI_RECOMMENDATIONS = {
  category: "무선 이어폰",
  details: [
    { id: "case-open", label: "충전 케이스 오픈 샷", defaultChecked: true },
    { id: "wearing-side", label: "착용감 강조 측면 컷", defaultChecked: true },
    { id: "touch-closeup", label: "터치 버튼 조작부 클로즈업", defaultChecked: true },
    { id: "size-compare", label: "크기 비교 컷", defaultChecked: false },
  ],
};

interface AIRecommendationProps {
  selectedDetails: string[];
  onSelectedChange: (details: string[]) => void;
}

export function AIRecommendation({ selectedDetails, onSelectedChange }: AIRecommendationProps) {
  const toggleDetail = (id: string) => {
    if (selectedDetails.includes(id)) {
      onSelectedChange(selectedDetails.filter((d) => d !== id));
    } else {
      onSelectedChange([...selectedDetails, id]);
    }
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-primary">AI가 이 제품을 분석했어요</span>
      </div>
      <p className="text-xs text-muted-foreground">
        제품 카테고리: <span className="text-foreground font-medium">{MOCK_AI_RECOMMENDATIONS.category}</span>
      </p>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">추천 상세컷:</p>
        {MOCK_AI_RECOMMENDATIONS.details.map((detail) => (
          <label
            key={detail.id}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <Checkbox
              checked={selectedDetails.includes(detail.id)}
              onCheckedChange={() => toggleDetail(detail.id)}
            />
            <span className="text-sm group-hover:text-foreground transition-colors">
              {detail.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
