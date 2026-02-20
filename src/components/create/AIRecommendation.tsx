import { Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export interface DetailRecommendation {
  category: string;
  details: { id: string; label: string; defaultChecked: boolean }[];
}

interface AIRecommendationProps {
  selectedDetails: string[];
  onSelectedChange: (details: string[]) => void;
  recommendation: DetailRecommendation | null;
}

export function AIRecommendation({ selectedDetails, onSelectedChange, recommendation }: AIRecommendationProps) {
  const toggleDetail = (id: string) => {
    if (selectedDetails.includes(id)) {
      onSelectedChange(selectedDetails.filter((d) => d !== id));
    } else {
      onSelectedChange([...selectedDetails, id]);
    }
  };

  if (!recommendation) return null;

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-primary">AI가 이 제품을 분석했어요</span>
      </div>
      <p className="text-xs text-muted-foreground">
        제품 카테고리: <span className="text-foreground font-medium">{recommendation.category}</span>
      </p>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">추천 상세컷:</p>
        {recommendation.details.map((detail) => (
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
