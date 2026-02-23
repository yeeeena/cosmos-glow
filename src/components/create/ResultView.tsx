import { Download, ArrowLeft, Loader2 } from "lucide-react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DetailOptions {
  basicDetails: boolean;
  aiRecommended: boolean;
  selectedAIDetails: string[];
  mainAspectRatio: string;
  basicAspectRatio: string;
  aiAspectRatio: string;
}

const ASPECT_RATIO_CLASS: Record<string, string> = {
  "1:1": "aspect-square",
  "9:16": "aspect-[9/16]",
  "16:9": "aspect-video",
  "3:4": "aspect-[3/4]",
  "4:3": "aspect-[4/3]",
};

interface ResultViewProps {
  isGenerating: boolean;
  onRestart: () => void;
  detailOptions: DetailOptions;
  generatedImage?: string | null;
  generatedDetailImages?: Record<string, string>;
  detailGeneratingIndex?: number;
}

const AI_DETAIL_LABELS: Record<string, string> = {
  "case-open": "충전 케이스 오픈 샷",
  "wearing-side": "착용감 강조 측면 컷",
  "touch-closeup": "터치 버튼 조작부 클로즈업",
  "size-compare": "크기 비교 컷",
};

const BASIC_DETAIL_LABELS: Record<string, string> = {
  "basic-1": "Image 1",
  "basic-2": "Image 2",
  "basic-3": "Image 3",
  "basic-4": "Image 4",
};

function buildResults(options: DetailOptions) {
  const results: { id: string; label: string; isMain?: boolean; type: "main" | "basic" | "ai" }[] = [
    { id: "main", label: "메인 컨셉샷", isMain: true, type: "main" },
  ];

  if (options.basicDetails) {
    results.push(
      { id: "basic-1", label: "Image 1", type: "basic" },
      { id: "basic-2", label: "Image 2", type: "basic" },
      { id: "basic-3", label: "Image 3", type: "basic" },
      { id: "basic-4", label: "Image 4", type: "basic" },
    );
  }

  if (options.aiRecommended) {
    options.selectedAIDetails.forEach((id) => {
      results.push({ id, label: AI_DETAIL_LABELS[id] || id, type: "ai" });
    });
  }

  return results;
}

export function ResultView({ isGenerating, onRestart, detailOptions, generatedImage, generatedDetailImages = {}, detailGeneratingIndex = -1 }: ResultViewProps) {
  const results = buildResults(detailOptions);
  const detailResults = results.filter((r) => !r.isMain);

  const handleDownload = (dataUri: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZipDownload = async () => {
    const zip = new JSZip();
    if (generatedImage) {
      const base64 = generatedImage.split(",")[1];
      zip.file("concept-shot.png", base64, { base64: true });
    }
    // Add detail images
    Object.entries(generatedDetailImages).forEach(([id, dataUri]) => {
      const base64 = dataUri.split(",")[1];
      if (base64) {
        zip.file(`detail-${id}.png`, base64, { base64: true });
      }
    });
    if (Object.keys(zip.files).length === 0) return;
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "conceptshot-images.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  if (isGenerating && !generatedImage) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-6">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-semibold">컨셉샷 생성 중...</p>
          <p className="text-sm text-muted-foreground">
            총 {results.length}장 · 약 30초 정도 소요됩니다
          </p>
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
        <h2 className="text-2xl font-bold">
          {detailGeneratingIndex >= 0 ? "상세컷 생성 중..." : "생성 완료! 🎉"}
        </h2>
        <p className="text-muted-foreground text-sm">
          {detailGeneratingIndex >= 0
            ? `상세컷 ${detailGeneratingIndex + 1}/4 생성 중...`
            : `총 ${results.length}장의 컨셉샷이 준비되었습니다`}
        </p>
      </div>

      {/* Main concept shot */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="relative group">
          <div className={cn(ASPECT_RATIO_CLASS[detailOptions.mainAspectRatio] || "aspect-square", "rounded-xl border border-border bg-card flex items-center justify-center overflow-hidden")}>
            {generatedImage ? (
              <img src={generatedImage} alt="생성된 컨셉샷" className="w-full h-full object-contain" />
            ) : (
              <p className="text-muted-foreground text-sm">메인 컨셉샷 미리보기</p>
            )}
          </div>
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => generatedImage && handleDownload(generatedImage, "concept-shot.png")} className="h-8 w-8 rounded-lg bg-background/80 backdrop-blur flex items-center justify-center hover:bg-accent">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail shots grid */}
      {detailResults.length > 0 && (
        <div className="max-w-2xl mx-auto w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
          {detailResults.map((result, idx) => {
            const detailImg = generatedDetailImages[result.id];
            const isCurrentlyGenerating = result.type === "basic" && detailGeneratingIndex >= 0 && idx === detailGeneratingIndex;
            const isPending = result.type === "basic" && detailGeneratingIndex >= 0 && idx > detailGeneratingIndex && !detailImg;
            return (
              <div key={result.id} className="relative group">
                <div className={cn(
                  ASPECT_RATIO_CLASS[result.type === "basic" ? detailOptions.basicAspectRatio : detailOptions.aiAspectRatio] || "aspect-square",
                  "rounded-xl border border-border bg-card flex items-center justify-center overflow-hidden"
                )}>
                  {detailImg ? (
                    <img src={detailImg} alt={result.label} className="w-full h-full object-contain" />
                  ) : isCurrentlyGenerating ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <p className="text-muted-foreground text-xs">생성 중...</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-xs text-center px-2">
                      {isPending ? "대기 중..." : result.label}
                    </p>
                  )}
                </div>
                {detailImg && (
                  <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDownload(detailImg, `detail-${result.id}.png`)} className="h-6 w-6 rounded-md bg-background/80 backdrop-blur flex items-center justify-center hover:bg-accent">
                      <Download className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 pb-16">
        <Button variant="outline" onClick={onRestart}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          새로 만들기
        </Button>
        <Button variant="glow" className="px-6" onClick={handleZipDownload}>
          <Download className="h-4 w-4 mr-2" />
          ZIP 다운로드
        </Button>
      </div>
    </div>
  );
}
