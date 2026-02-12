import { useRef } from "react";
import { Camera, Zap, Leaf, Cpu, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stylePresets = [
  {
    id: "minimal-studio",
    label: "미니멀 스튜디오",
    description: "깔끔한 배경, 소프트 라이팅",
    keywords: "화이트/그레이 톤, 그림자",
    icon: Camera,
    gradient: "from-gray-400/20 to-gray-600/20",
  },
  {
    id: "dynamic-angle",
    label: "다이나믹 앵글",
    description: "역동적 구도, 강렬한 조명 대비",
    keywords: "로우앵글, 하이라이트",
    icon: Zap,
    gradient: "from-orange-400/20 to-red-600/20",
  },
  {
    id: "nature-lifestyle",
    label: "네이처/라이프스타일",
    description: "자연광, 생활 맥락 속 제품",
    keywords: "나무, 패브릭, 일상",
    icon: Leaf,
    gradient: "from-green-400/20 to-emerald-600/20",
  },
  {
    id: "tech-futuristic",
    label: "테크/퓨처리스틱",
    description: "네온, 그리드, SF 감성",
    keywords: "다크 배경, 글로우",
    icon: Cpu,
    gradient: "from-blue-400/20 to-purple-600/20",
  },
];

interface StepStyleProps {
  selectedStyle: string | null;
  referenceImage: string | null;
  onStyleChange: (style: string | null) => void;
  onReferenceChange: (url: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepStyle({
  selectedStyle,
  referenceImage,
  onStyleChange,
  onReferenceChange,
  onNext,
  onBack,
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
    <div className="flex flex-col flex-1 gap-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">컨셉 스타일 선택</h2>
        <p className="text-muted-foreground text-sm">
          원하는 촬영 스타일을 선택하거나 레퍼런스 이미지를 업로드하세요
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto w-full">
        {stylePresets.map((style) => {
          const isSelected = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => selectPreset(style.id)}
              className={cn(
                "relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all text-center",
                isSelected
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                  : "border-border bg-card hover:border-muted-foreground/40 hover:bg-accent/50"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              <div className={cn("h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center", style.gradient)}>
                <style.icon className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">{style.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
              </div>
            </button>
          );
        })}

        {/* Custom reference upload */}
        <input
          ref={refInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleRefUpload}
        />
        <button
          onClick={() => refInputRef.current?.click()}
          className={cn(
            "relative col-span-2 lg:col-span-4 flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
            selectedStyle === "custom"
              ? "border-primary bg-primary/10"
              : "border-dashed border-border bg-card/50 hover:border-muted-foreground/40"
          )}
        >
          {referenceImage ? (
            <img src={referenceImage} alt="레퍼런스" className="h-14 w-14 rounded-lg object-cover" />
          ) : (
            <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="text-left">
            <p className="text-sm font-medium">직접 레퍼런스 업로드</p>
            <p className="text-xs text-muted-foreground">원하는 스타일의 이미지를 업로드하세요</p>
          </div>
        </button>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" onClick={onBack}>이전</Button>
        <Button
          onClick={onNext}
          disabled={!selectedStyle}
          variant="glow"
          className="px-8"
        >
          옵션 선택하기
        </Button>
      </div>
    </div>
  );
}
