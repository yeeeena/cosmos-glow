import { useState } from "react";
import { Download, ArrowLeft, Maximize2 } from "lucide-react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface DetailOptions {
  basicDetails: boolean;
  aiRecommended: boolean;
  selectedAIDetails: string[];
  mainAspectRatio: string;
  basicAspectRatio: string;
  aiAspectRatio: string;
}

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

function buildResults(options: DetailOptions) {
  const basicResults: { id: string; label: string }[] = [];
  const aiResults: { id: string; label: string }[] = [];

  if (options.basicDetails) {
    basicResults.push(
      { id: "basic-1", label: "Image 1" },
      { id: "basic-2", label: "Image 2" },
    );
  }

  if (options.aiRecommended) {
    options.selectedAIDetails.forEach((id) => {
      aiResults.push({ id, label: AI_DETAIL_LABELS[id] || id });
    });
  }

  return { basicResults, aiResults };
}

function ImageCard({
  src,
  label,
  onDownload,
  onPreview,
}: {
  src?: string;
  label: string;
  onDownload: () => void;
  onPreview: () => void;
}) {
  return (
    <div className="relative group">
      <div className="w-64 h-64 rounded-xl border border-border bg-card flex items-center justify-center overflow-hidden">
        {src ? (
          <img src={src} alt={label} className="w-full h-full object-contain" />
        ) : (
          <p className="text-muted-foreground text-xs text-center px-2">{label}</p>
        )}
      </div>
      {src && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onPreview}
            className="h-8 w-8 rounded-lg bg-background/80 backdrop-blur flex items-center justify-center hover:bg-accent"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDownload}
            className="h-8 w-8 rounded-lg bg-background/80 backdrop-blur flex items-center justify-center hover:bg-accent"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function ResultView({
  isGenerating,
  onRestart,
  detailOptions,
  generatedImage,
  generatedDetailImages = {},
}: ResultViewProps) {
  const [previewImage, setPreviewImage] = useState<{ src: string; label: string } | null>(null);
  const { basicResults, aiResults } = buildResults(detailOptions);
  const totalCount = 1 + basicResults.length + aiResults.length;

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
    Object.entries(generatedDetailImages).forEach(([id, dataUri]) => {
      const base64 = dataUri.split(",")[1];
      if (base64) zip.file(`detail-${id}.png`, base64, { base64: true });
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
            총 {totalCount}장 · 약 30초 정도 소요됩니다
          </p>
        </div>
        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">생성 완료! 🎉</h2>
        <p className="text-muted-foreground text-sm">
          총 {totalCount}장의 컨셉샷이 준비되었습니다
        </p>
      </div>

      {/* 메인 컨셉샷 섹션 */}
      <section className="max-w-3xl mx-auto w-full space-y-3">
        <h3 className="text-base font-semibold text-foreground">메인 컨셉샷</h3>
        <div className="flex justify-center">
          <ImageCard
            src={generatedImage ?? undefined}
            label="메인 컨셉샷"
            onDownload={() => generatedImage && handleDownload(generatedImage, "concept-shot.png")}
            onPreview={() => generatedImage && setPreviewImage({ src: generatedImage, label: "메인 컨셉샷" })}
          />
        </div>
      </section>

      {/* 기본 상세컷 섹션 */}
      {basicResults.length > 0 && (
        <section className="max-w-3xl mx-auto w-full space-y-3">
          <h3 className="text-base font-semibold text-foreground">기본 상세컷</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {basicResults.map((r) => {
              const img = generatedDetailImages[r.id];
              return (
                <ImageCard
                  key={r.id}
                  src={img}
                  label={r.label}
                  onDownload={() => img && handleDownload(img, `detail-${r.id}.png`)}
                  onPreview={() => img && setPreviewImage({ src: img, label: r.label })}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* AI 추천 상세컷 섹션 */}
      {aiResults.length > 0 && (
        <section className="max-w-3xl mx-auto w-full space-y-3">
          <h3 className="text-base font-semibold text-foreground">AI 추천 상세컷</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {aiResults.map((r) => {
              const img = generatedDetailImages[r.id];
              return (
                <ImageCard
                  key={r.id}
                  src={img}
                  label={r.label}
                  onDownload={() => img && handleDownload(img, `detail-${r.id}.png`)}
                  onPreview={() => img && setPreviewImage({ src: img, label: r.label })}
                />
              );
            })}
          </div>
        </section>
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

      {/* 확대보기 Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-2">
          <DialogTitle className="sr-only">{previewImage?.label ?? "이미지 확대보기"}</DialogTitle>
          {previewImage && (
            <div className="flex flex-col items-center gap-3">
              <img
                src={previewImage.src}
                alt={previewImage.label}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{previewImage.label}</span>
                <button
                  onClick={() => handleDownload(previewImage.src, `${previewImage.label}.png`)}
                  className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center hover:bg-accent"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
