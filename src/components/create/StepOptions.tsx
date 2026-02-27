import { Check, Image, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIRecommendation, type DetailRecommendation } from "./AIRecommendation";
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
    <div className="flex flex-col flex-1 gap-7">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-primary/10 border border-primary/20 mb-2">
          <span className="text-label-xs text-primary uppercase tracking-wider">Step 3</span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight">생성 옵션 선택</h2>
        <p className="text-paragraph-md text-muted-foreground">
          메인 컨셉샷 1장은 필수 포함됩니다. 추가 상세컷을 선택하세요.
        </p>
      </div>

      <div className="max-w-md mx-auto w-full space-y-2.5">

        {/* Main shot — always included */}
        <div className="p-4 rounded-[12px] border border-primary/30 bg-primary/5 shadow-[0_0_0_1px_rgba(27,98,255,0.08)] space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[10px] bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
              <Image className="h-4 w-4 text-primary" strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-label-md text-foreground">메인 컨셉샷 1장</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-primary/15 border border-primary/25 text-label-xs text-primary">
                  필수
                </span>
              </div>
              <p className="text-paragraph-sm text-muted-foreground mt-0.5">선택한 스타일로 메인 컨셉샷 생성</p>
            </div>
          </div>
        </div>

        {/* Basic details */}
        <div className={cn(
          "rounded-[12px] border transition-all duration-150",
          detailOptions.basicDetails
            ? "border-primary/30 bg-primary/5 shadow-[0_0_0_1px_rgba(27,98,255,0.08)]"
            : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--border-strong))]"
        )}>
          <button
            onClick={() => onDetailOptionsChange({ ...detailOptions, basicDetails: !detailOptions.basicDetails })}
            className="w-full flex items-center gap-3 p-4 text-left"
          >
            <div className={cn(
              "h-9 w-9 rounded-[10px] border flex items-center justify-center shrink-0 transition-colors",
              detailOptions.basicDetails ? "bg-primary/15 border-primary/20" : "bg-[hsl(var(--muted))] border-[hsl(var(--border))]"
            )}>
              <Image className={cn("h-4 w-4", detailOptions.basicDetails ? "text-primary" : "text-muted-foreground")} strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <p className="text-label-md text-foreground">기본 상세컷 2장</p>
              <p className="text-paragraph-sm text-muted-foreground mt-0.5">카테고리별 맞춤 상세컷 자동 생성</p>
            </div>
            <div className={cn(
              "h-5 w-5 rounded-[5px] border-2 flex items-center justify-center shrink-0 transition-all",
              detailOptions.basicDetails ? "bg-primary border-primary shadow-[0_0_8px_rgba(27,98,255,0.3)]" : "border-[hsl(var(--border-strong))]"
            )}>
              {detailOptions.basicDetails && <Check className="h-3 w-3 text-white" strokeWidth={2.5} />}
            </div>
          </button>
        </div>

        {/* AI recommended */}
        <div className={cn(
          "rounded-[12px] border transition-all duration-150",
          detailOptions.aiRecommended
            ? "border-primary/30 bg-primary/5 shadow-[0_0_0_1px_rgba(27,98,255,0.08)]"
            : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--border-strong))]"
        )}>
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
              "h-9 w-9 rounded-[10px] border flex items-center justify-center shrink-0 transition-colors",
              detailOptions.aiRecommended ? "bg-primary/15 border-primary/20" : "bg-[hsl(var(--muted))] border-[hsl(var(--border))]"
            )}>
              <Sparkles className={cn("h-4 w-4", detailOptions.aiRecommended ? "text-primary" : "text-muted-foreground")} strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-label-md text-foreground">AI 추천 상세컷</p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-[5px] bg-primary/10 border border-primary/20 text-label-xs text-primary">AI</span>
              </div>
              <p className="text-paragraph-sm text-muted-foreground mt-0.5">AI가 제품에 맞는 상세컷 자동 제안</p>
            </div>
            <div className={cn(
              "h-5 w-5 rounded-[5px] border-2 flex items-center justify-center shrink-0 transition-all",
              detailOptions.aiRecommended ? "bg-primary border-primary shadow-[0_0_8px_rgba(27,98,255,0.3)]" : "border-[hsl(var(--border-strong))]"
            )}>
              {detailOptions.aiRecommended && <Check className="h-3 w-3 text-white" strokeWidth={2.5} />}
            </div>
          </button>
        </div>

        {detailOptions.aiRecommended && (
          <AIRecommendation
            selectedDetails={detailOptions.selectedAIDetails}
            onSelectedChange={(details) => onDetailOptionsChange({ ...detailOptions, selectedAIDetails: details })}
            recommendation={detailRecommendation}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-2.5">
        <Button variant="stroke" size="md" onClick={onBack} className="px-6 gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          이전
        </Button>
        <Button onClick={onGenerate} variant="fancy" size="md" className="px-8 gap-2 font-semibold">
          <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" aria-hidden="true">
            <path d="m7.076266666666666 11.863733333333332 0.5850666666666666 -1.3401333333333334c0.5207333333333333 -1.1925333333333332 1.4579333333333333 -2.1418666666666666 2.627 -2.6608l1.6104666666666667 -0.7148666666666667c0.512 -0.22726666666666664 0.512 -0.9721466666666667 0 -1.19942l-1.5602 -0.6925533333333332c-1.1991333333333332 -0.53228 -2.153133333333333 -1.5167533333333332 -2.664933333333333 -2.75l-0.5926666666666667 -1.42814c-0.21993333333333334 -0.5299766666666667 -0.9522066666666666 -0.5299753333333332 -1.1721333333333332 0l-0.5926866666666666 1.4281266666666665c-0.5118 1.23326 -1.4658266666666666 2.2177333333333333 -2.6649466666666664 2.7500133333333334L1.0910533333333332 5.948513333333333c-0.5120286666666667 0.22727333333333333 -0.5120293333333332 0.9721533333333332 0 1.19942l1.61048 0.7148666666666667c1.16906 0.5189333333333332 2.106273333333333 1.4682666666666666 2.6269666666666662 2.6608l0.5851 1.3401333333333334c0.22490666666666664 0.5150666666666666 0.9377333333333333 0.5150666666666666 1.1626666666666665 0Zm5.8580000000000005 3.2628666666666666 0.1645333333333333 -0.3771333333333333c0.29333333333333333 -0.6723999999999999 0.8216666666666665 -1.2078 1.4808666666666666 -1.5006666666666666l0.5069333333333332 -0.22526666666666664c0.2742 -0.12179999999999999 0.2742 -0.5202666666666667 0 -0.6420666666666666l-0.4785333333333333 -0.21266666666666667c-0.6761999999999999 -0.3004 -1.214 -0.8556 -1.502333333333333 -1.5508666666666664l-0.16893333333333332 -0.4075333333333333c-0.11779999999999999 -0.284 -0.5104666666666666 -0.284 -0.6282666666666666 0l-0.16893333333333332 0.4075333333333333c-0.28826666666666667 0.6952666666666666 -0.8260666666666667 1.2504666666666666 -1.5022666666666666 1.5508666666666664l-0.47859999999999997 0.21266666666666667c-0.27413333333333334 0.12179999999999999 -0.27413333333333334 0.5202666666666667 0 0.6420666666666666l0.5069333333333332 0.22526666666666664c0.6592666666666667 0.29286666666666666 1.1875333333333333 0.8282666666666666 1.4808666666666666 1.5006666666666666l0.1646 0.3771333333333333c0.12040000000000001 0.2760666666666667 0.5026666666666666 0.2760666666666667 0.6231333333333333 0Z" />
          </svg>
          생성하기
        </Button>
      </div>
    </div>
  );
}
