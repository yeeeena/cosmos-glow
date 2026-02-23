import { Check, Image, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIRecommendation, type DetailRecommendation } from "./AIRecommendation";
import { AspectRatioSelector } from "./AspectRatioSelector";
import { cn } from "@/lib/utils";

interface DetailOptions {
  basicDetails: boolean;
  aiRecommended: boolean;
  selectedAIDetails: string[];
  mainAspectRatio: string;
  basicAspectRatio: string;
  aiAspectRatio: string;
}

interface StepOptionsProps {
  detailOptions: DetailOptions;
  onDetailOptionsChange: (opts: DetailOptions) => void;
  onGenerate: () => void;
  onBack: () => void;
  detailRecommendation: DetailRecommendation | null;
}

export function StepOptions({
  detailOptions,
  onDetailOptionsChange,
  onGenerate,
  onBack,
  detailRecommendation,
}: StepOptionsProps) {
  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">생성 옵션 선택</h2>
        <p className="text-muted-foreground text-sm">
          메인 컨셉샷 1장은 필수로 포함됩니다. 추가 상세컷을 선택하세요.
        </p>
      </div>

      <div className="max-w-lg mx-auto w-full space-y-4">
        {/* Main shot - always included */}
        <div className="p-4 rounded-xl border border-primary bg-primary/10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Image className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">메인 컨셉샷 1장</p>
              <p className="text-xs text-muted-foreground">필수 포함</p>
            </div>
          </div>
          <AspectRatioSelector
            value={detailOptions.mainAspectRatio}
            onChange={(r) => onDetailOptionsChange({ ...detailOptions, mainAspectRatio: r })}
          />
        </div>

        {/* Basic details */}
        <div
          className={cn(
            "rounded-xl border-2 transition-all",
            detailOptions.basicDetails
              ? "border-primary bg-primary/10"
              : "border-border bg-card hover:border-muted-foreground/40"
          )}
        >
          <button
            onClick={() =>
              onDetailOptionsChange({ ...detailOptions, basicDetails: !detailOptions.basicDetails })
            }
            className="w-full flex items-center gap-3 p-4 text-left"
          >
            <div className={cn(
              "h-5 w-5 rounded border flex items-center justify-center shrink-0",
              detailOptions.basicDetails ? "bg-primary border-primary" : "border-muted-foreground/40"
            )}>
              {detailOptions.basicDetails && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">기본 상세컷 4장</p>
              <p className="text-xs text-muted-foreground">카테고리별 맞춤 상세컷 자동 생성</p>
            </div>
            
          </button>
          {detailOptions.basicDetails && (
            <div className="px-4 pb-3">
              <AspectRatioSelector
                value={detailOptions.basicAspectRatio}
                onChange={(r) => onDetailOptionsChange({ ...detailOptions, basicAspectRatio: r })}
              />
            </div>
          )}
        </div>

        {/* AI recommended */}
        <div
          className={cn(
            "rounded-xl border-2 transition-all",
            detailOptions.aiRecommended
              ? "border-primary bg-primary/10"
              : "border-border bg-card hover:border-muted-foreground/40"
          )}
        >
          <button
            onClick={() =>
              onDetailOptionsChange({
                ...detailOptions,
                aiRecommended: !detailOptions.aiRecommended,
                selectedAIDetails: !detailOptions.aiRecommended && detailRecommendation
                  ? detailRecommendation.details.filter(d => d.defaultChecked).map(d => d.id)
                  : detailOptions.selectedAIDetails,
              })
            }
            className="w-full flex items-center gap-3 p-4 text-left"
          >
            <div className={cn(
              "h-5 w-5 rounded border flex items-center justify-center shrink-0",
              detailOptions.aiRecommended ? "bg-primary border-primary" : "border-muted-foreground/40"
            )}>
              {detailOptions.aiRecommended && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                AI 추천 상세컷
              </p>
              <p className="text-xs text-muted-foreground">AI가 제품에 맞는 상세컷을 자동 제안</p>
            </div>
            
          </button>
          {detailOptions.aiRecommended && (
            <div className="px-4 pb-3">
              <AspectRatioSelector
                value={detailOptions.aiAspectRatio}
                onChange={(r) => onDetailOptionsChange({ ...detailOptions, aiAspectRatio: r })}
              />
            </div>
          )}
        </div>

        {/* AI recommendation details */}
        {detailOptions.aiRecommended && (
          <AIRecommendation
            selectedDetails={detailOptions.selectedAIDetails}
            onSelectedChange={(details) =>
              onDetailOptionsChange({ ...detailOptions, selectedAIDetails: details })
            }
            recommendation={detailRecommendation}
          />
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" onClick={onBack}>이전</Button>
        <Button onClick={onGenerate} variant="glow" className="px-8">
          생성하기
        </Button>
      </div>
    </div>
  );
}
