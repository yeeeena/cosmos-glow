import { useRef } from "react";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import styleMinimalStudio from "@/assets/style-minimal-studio.webp";
import styleDynamicAngle from "@/assets/style-dynamic-angle.jpg";
import styleNatureLifestyle from "@/assets/style-nature-lifestyle.jpg";
import styleTechFuturistic from "@/assets/style-tech-futuristic.webp";
import styleDarklightStudio from "@/assets/style-darklight-studio.png";

const stylePresets = [
  { id: "minimal-studio",   label: "미니멀 스튜디오",    description: "깔끔한 배경, 소프트 라이팅",           thumbnail: styleMinimalStudio },
  { id: "dynamic-angle",    label: "다이나믹 앵글",       description: "역동적 구도, 강렬한 조명 대비",         thumbnail: styleDynamicAngle },
  { id: "nature-lifestyle", label: "네이처/라이프스타일", description: "자연광, 생활 맥락 속 제품",             thumbnail: styleNatureLifestyle },
  { id: "tech-futuristic",  label: "테크/퓨처리스틱",     description: "네온, 그리드, SF 감성",                thumbnail: styleTechFuturistic },
  { id: "darklight-studio", label: "다크라이트 스튜디오", description: "드라마틱한 조명, 소재 분석 럭셔리샷",   thumbnail: styleDarklightStudio },
];

interface StepStyleProps {
  selectedStyle: string | null;
  referenceImage: string | null;
  onStyleChange: (style: string | null) => void;
  onReferenceChange: (url: string | null) => void;
  onNext: () => void;
  onBack: () => void;
  isAnalyzing?: boolean;
}

export function StepStyle({
  selectedStyle,
  referenceImage,
  onStyleChange,
  onReferenceChange,
  onNext,
  onBack,
  isAnalyzing = false,
}: StepStyleProps) {
  const refInputRef = useRef<HTMLInputElement>(null);

  const handleRefUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onReferenceChange(url);
      onStyleChange("custom");
    }
  };

  const selectPreset = (id: string) => {
    onStyleChange(id);
    onReferenceChange(null);
  };

  return (
    <div className="flex flex-col flex-1 gap-7">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-primary/10 border border-primary/20 mb-2">
          <span className="text-label-xs text-primary uppercase tracking-wider">Step 2</span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight">컨셉 스타일 선택</h2>
        <p className="text-paragraph-md text-muted-foreground">
          원하는 촬영 스타일을 선택하거나 레퍼런스 이미지를 업로드하세요
        </p>
      </div>

      {/* Style grid — custom upload card 맨 앞 + preset cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 max-w-5xl mx-auto w-full">

        {/* 직접 레퍼런스 업로드 카드 — 맨 앞 */}
        <input
          ref={refInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleRefUpload}
        />
        <figure
          onClick={() => refInputRef.current?.click()}
          className={cn(
            "group relative rounded-[14px] overflow-hidden cursor-pointer transition-all duration-200",
            selectedStyle === "custom"
              ? "ring-2 ring-primary shadow-[0_0_16px_rgba(27,98,255,0.35)]"
              : "ring-1 ring-white/5 hover:ring-white/10"
          )}
          style={{ aspectRatio: "3/4" }}
        >
          {referenceImage ? (
            /* 업로드된 이미지가 있으면 꽉 채워서 표시 */
            <>
              <img
                src={referenceImage}
                alt="레퍼런스"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
              {/* 호버 dim */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200" />
              {/* 상단 그라데이션 + 타이틀 */}
              <div
                className="absolute inset-x-0 top-0 z-10 px-3 py-2.5"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)" }}
              >
                <p className="text-[13px] font-semibold text-white leading-tight truncate">
                  직접 업로드
                </p>
              </div>
              {/* 호버 시 하단 변경 버튼 */}
              <div className="absolute inset-x-0 bottom-0 z-10 px-3 pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  className="w-full h-8 rounded-full text-[13px] font-semibold text-white transition-all"
                  style={{ background: "rgba(27,98,255,0.85)", backdropFilter: "blur(6px)" }}
                  onClick={(e) => { e.stopPropagation(); refInputRef.current?.click(); }}
                >
                  변경하기
                </button>
              </div>
            </>
          ) : (
            /* 업로드 전 — 점선 + 아이콘 */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-[hsl(var(--card))] border-2 border-dashed border-white/10 rounded-[14px] group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-200">
              {/* 업로드 아이콘 */}
              <div className="h-10 w-10 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/10 transition-all duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="-0.5 -0.5 16 16"
                  fill="none"
                  className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200"
                  aria-hidden="true"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.125 7.5v4.375a1.25 1.25 0 0 1 -1.25 1.25h-1.875m3.125 -5.625c-4.02625 0 -6.315625000000001 1.240625 -7.534375 2.6518750000000004M13.125 7.5v-0.9375M1.875 10v1.875a1.25 1.25 0 0 0 1.25 1.25v0h6.875M1.875 10V3.125a1.25 1.25 0 0 1 1.25 -1.25h5M1.875 10c0.8768750000000001 -0.14625000000000002 2.273125 -0.18312499999999998 3.715625 0.15187499999999998M10 13.125c-1.065 -1.73 -2.7668749999999998 -2.5925 -4.409375 -2.9731249999999996M5.3125 4.375C5 4.375 4.375 4.5625 4.375 5.3125S5 6.25 5.3125 6.25 6.25 6.0625 6.25 5.3125 5.625 4.375 5.3125 4.375zM11.875 1.25v1.875m0 1.875V3.125m0 0h1.875m-1.875 0h-1.875"
                    strokeWidth="1"
                  />
                </svg>
              </div>
              <div className="text-center px-2">
                <p className="text-[13px] font-semibold text-white/70 group-hover:text-white leading-tight transition-colors duration-200">
                  직접 업로드
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                  레퍼런스 이미지
                </p>
              </div>
            </div>
          )}

          {/* 선택됨 — 파란 테두리 + 우상단 체크 */}
          {selectedStyle === "custom" && (
            <>
              <div className="absolute inset-0 border-2 border-primary rounded-[14px] pointer-events-none" />
              <div className="absolute top-2 right-2 z-20 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-[0_2px_8px_rgba(27,98,255,0.5)]">
                <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
              </div>
            </>
          )}
        </figure>

        {/* Preset style cards */}
        {stylePresets.map((style) => {
          const isSelected = selectedStyle === style.id;
          return (
            <figure
              key={style.id}
              onClick={() => selectPreset(style.id)}
              className={cn(
                "group relative rounded-[14px] overflow-hidden cursor-pointer transition-all duration-200",
                isSelected
                  ? "ring-2 ring-primary shadow-[0_0_16px_rgba(27,98,255,0.35)]"
                  : "ring-1 ring-white/5 hover:ring-white/10"
              )}
              style={{ aspectRatio: "3/4" }}
            >
              {/* 배경 이미지 */}
              <img
                src={style.thumbnail}
                alt={style.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />

              {/* 호버 dim 오버레이 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200" />

              {/* 상단 그라데이션 + 타이틀 */}
              <div
                className="absolute inset-x-0 top-0 z-10 px-3 py-2.5"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)" }}
              >
                <p className="text-[13px] font-semibold text-white leading-tight truncate">
                  {style.label}
                </p>
              </div>

              {/* 호버 시 하단 선택 버튼 */}
              <div className="absolute inset-x-0 bottom-0 z-10 px-3 pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  className="w-full h-8 rounded-full text-[13px] font-semibold text-white transition-all"
                  style={{ background: "rgba(27,98,255,0.85)", backdropFilter: "blur(6px)" }}
                  onClick={(e) => { e.stopPropagation(); selectPreset(style.id); }}
                >
                  선택하기
                </button>
              </div>

              {/* 선택됨 — 파란 테두리 + 우상단 체크 */}
              {isSelected && (
                <>
                  <div className="absolute inset-0 border-2 border-primary rounded-[14px] pointer-events-none" />
                  <div className="absolute top-2 right-2 z-20 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-[0_2px_8px_rgba(27,98,255,0.5)]">
                    <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                  </div>
                </>
              )}
            </figure>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-2.5">
        <Button variant="stroke" size="md" onClick={onBack} className="px-6 gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          이전
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedStyle || isAnalyzing}
          variant="fancy"
          size="md"
          className="px-8 gap-2 font-semibold"
        >
          {isAnalyzing ? (
            <>
              <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              분석 중...
            </>
          ) : (
            <>
              다음단계
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
