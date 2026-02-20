import { Check, Image, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIRecommendation, ShotsAnalysis } from "./AIRecommendation";
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
  shotsAnalysis?: ShotsAnalysis | null;
  isShotsAnalyzing?: boolean;
}

export function StepOptions({
  detailOptions,
  onDetailOptionsChange,
  onGenerate,
  onBack,
  shotsAnalysis,
  isShotsAnalyzing,
}: StepOptionsProps) {
  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">생성 옵션 선택</h2>
        <p className="text-muted-foreground text-sm">
          제품에서 생성할 컷수를 선택하세요. 추가 상세컷을 포함할 수 있습니다.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* 기본 컷 옵션 */}
        <div
          className={cn(
            "border rounded-xl p-4 cursor-pointer transition-all",
            detailOptions.basicDetails ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          )}
          onClick={() =>
            onDetailOptionsChange({
              ...detailOptions,
              basicDetails: !detailOptions.basicDetails,
            })
          }
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                detailOptions.basicDetails ? "border-primary bg-primary" : "border-muted-foreground",
              )}
            >
              {detailOptions.basicDetails && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                <span className="font-medium">기본 상세컷</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">제품의 기본적인 상세컷을 생성합니다</p>
              {detailOptions.basicDetails && (
                <div className="mt-3">
                  <AspectRatioSelector
                    value={detailOptions.basicAspectRatio}
                    onChange={(val) =>
                      onDetailOptionsChange({
                        ...detailOptions,
                        basicAspectRatio: val,
                      })
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI 추천 컷 옵션 */}
        <div
          className={cn(
            "border rounded-xl p-4 cursor-pointer transition-all",
            detailOptions.aiRecommended ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          )}
          onClick={() =>
            onDetailOptionsChange({
              ...detailOptions,
              aiRecommended: !detailOptions.aiRecommended,
            })
          }
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                detailOptions.aiRecommended ? "border-primary bg-primary" : "border-muted-foreground",
              )}
            >
              {detailOptions.aiRecommended && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium">AI 추천 상세컷</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">AI가 제품을 분석하여 최적의 상세컷을 추천합니다</p>
              {detailOptions.aiRecommended && (
                <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                  <AspectRatioSelector
                    value={detailOptions.aiAspectRatio}
                    onChange={(val) =>
                      onDetailOptionsChange({
                        ...detailOptions,
                        aiAspectRatio: val,
                      })
                    }
                  />
                  <div className="mt-4">
                    <AIRecommendation
                      shotsAnalysis={shotsAnalysis}
                      isLoading={isShotsAnalyzing}
                      selectedDetails={detailOptions.selectedAIDetails}
                      onSelectedChange={(selected) =>
                        onDetailOptionsChange({
                          ...detailOptions,
                          selectedAIDetails: selected,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-auto">
        <Button variant="outline" onClick={onBack} className="flex-1">
          이전
        </Button>
        <Button
          onClick={onGenerate}
          className="flex-1"
          disabled={!detailOptions.basicDetails && !detailOptions.aiRecommended}
        >
          컨셉샷 생성하기
        </Button>
      </div>
    </div>
  );
}
