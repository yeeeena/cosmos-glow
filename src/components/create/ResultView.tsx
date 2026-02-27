import { useState } from "react";
import { Download, ArrowLeft, Maximize2, CheckCircle2, Archive } from "lucide-react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
  "touch-closeup": "터치 버튼 클로즈업",
  "size-compare": "크기 비교 컷",
};

function buildResults(options: DetailOptions) {
  const basicResults: { id: string; label: string }[] = [];
  const aiResults: { id: string; label: string }[] = [];

  if (options.basicDetails) {
    basicResults.push(
      { id: "basic-1", label: "상세컷 1" },
      { id: "basic-2", label: "상세컷 2" },
    );
  }
  if (options.aiRecommended) {
    options.selectedAIDetails.forEach((id) => {
      aiResults.push({ id, label: AI_DETAIL_LABELS[id] || id });
    });
  }
  return { basicResults, aiResults };
}

/* ── Align UI Image Card ── */
function ImageCard({
  src,
  label,
  badge,
  onDownload,
  onPreview,
}: {
  src?: string;
  label: string;
  badge?: string;
  onDownload: () => void;
  onPreview: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 group">
      <div className="relative">
        <div className={cn(
          "w-52 h-52 rounded-[14px] border bg-[hsl(var(--card))] flex items-center justify-center overflow-hidden transition-all duration-200",
          src
            ? "border-[hsl(var(--border))] group-hover:border-primary/30 group-hover:shadow-[0_0_0_1px_rgba(27,98,255,0.15),0_8px_24px_rgba(0,0,0,0.4)]"
            : "border-dashed border-[hsl(var(--border))] opacity-50"
        )}>
          {src ? (
            <img src={src} alt={label} className="w-full h-full object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin" />
              <p className="text-paragraph-sm">생성 중...</p>
            </div>
          )}
        </div>

        {/* Align UI: hover action overlay */}
        {src && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="compact" onClick={onPreview}>
              <Maximize2 />
            </Button>
            <Button variant="compact" onClick={onDownload}>
              <Download />
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-0.5">
        <p className="text-label-sm text-muted-foreground">{label}</p>
        {badge && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-[5px] bg-primary/10 border border-primary/20 text-label-xs text-primary">
            {badge}
          </span>
        )}
      </div>
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
          <div className="absolute inset-0 rounded-full border-[3px] border-[hsl(var(--border))]" />
          <div className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-1.5">
          <p className="text-label-lg">컨셉샷 생성 중...</p>
          <p className="text-paragraph-md text-muted-foreground">
            총 {totalCount}장 · 약 30초 소요됩니다
          </p>
        </div>
        <div className="w-56 space-y-1.5">
          <div className="h-1 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 gap-8">

      {/* Header — Align UI: success state */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-emerald-500/10 border border-emerald-500/20 mb-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2} />
          <span className="text-label-xs text-emerald-400 uppercase tracking-wider">생성 완료</span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight">컨셉샷이 준비되었어요</h2>
        <p className="text-paragraph-md text-muted-foreground">
          총 <span className="text-foreground font-semibold">{totalCount}장</span>의 이미지가 생성되었습니다
        </p>
      </div>

      {/* 메인 컨셉샷 */}
      <section className="max-w-3xl mx-auto w-full space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[20px] font-bold text-foreground">메인 컨셉샷</h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-primary/10 border border-primary/20 text-label-xs text-primary">메인</span>
        </div>
        <div className="flex">
          <div className="relative group">
            <div className={cn(
              "w-52 h-52 rounded-[14px] border bg-[hsl(var(--card))] flex items-center justify-center overflow-hidden transition-all duration-200",
              generatedImage
                ? "border-[hsl(var(--border))] group-hover:border-primary/30 group-hover:shadow-[0_0_0_1px_rgba(27,98,255,0.15),0_8px_24px_rgba(0,0,0,0.4)]"
                : "border-dashed border-[hsl(var(--border))]"
            )}>
              {generatedImage
                ? <img src={generatedImage} alt="메인 컨셉샷" className="w-full h-full object-contain" />
                : <p className="text-paragraph-sm text-muted-foreground">생성 중...</p>
              }
            </div>
            {generatedImage && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="compact" onClick={() => setPreviewImage({ src: generatedImage, label: "메인 컨셉샷" })}>
                  <Maximize2 />
                </Button>
                <Button variant="compact" onClick={() => handleDownload(generatedImage, "concept-shot.png")}>
                  <Download />
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 기본 상세컷 */}
      {basicResults.length > 0 && (
        <section className="max-w-3xl mx-auto w-full space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-[20px] font-bold text-foreground">기본 상세컷</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-label-xs text-muted-foreground">{basicResults.length}장</span>
          </div>
          <div className="flex flex-wrap gap-3">
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

      {/* AI 추천 상세컷 */}
      {aiResults.length > 0 && (
        <section className="max-w-3xl mx-auto w-full space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-[20px] font-bold text-foreground">AI 추천 상세컷</h3>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-[5px] bg-primary/10 border border-primary/20 text-label-xs text-primary">AI</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-label-xs text-muted-foreground">{aiResults.length}장</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {aiResults.map((r) => {
              const img = generatedDetailImages[r.id];
              return (
                <ImageCard
                  key={r.id}
                  src={img}
                  label={r.label}
                  badge="AI"
                  onDownload={() => img && handleDownload(img, `detail-${r.id}.png`)}
                  onPreview={() => img && setPreviewImage({ src: img, label: r.label })}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Actions — Align UI: stroke + glow 조합 */}
      <div className="flex items-center justify-center gap-2.5 pb-16">
        <Button variant="stroke" size="md" onClick={onRestart} className="px-6 gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          새로 만들기
        </Button>
        <Button variant="fancy" size="md" className="px-7 gap-2 font-semibold" onClick={handleZipDownload}>
          <Archive className="h-4 w-4" />
          ZIP 다운로드
        </Button>
      </div>

      {/* Preview Dialog — Align UI: elevated card */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-2 bg-[hsl(var(--popover))] border border-[hsl(var(--border-strong))] shadow-[var(--shadow-xl)] rounded-[16px]">
          <DialogTitle className="sr-only">{previewImage?.label ?? "이미지 확대보기"}</DialogTitle>
          {previewImage && (
            <div className="flex flex-col items-center gap-3">
              <img
                src={previewImage.src}
                alt={previewImage.label}
                className="max-w-full max-h-[78vh] object-contain rounded-[12px]"
              />
              <div className="flex items-center gap-2 pb-1">
                <span className="text-paragraph-sm text-muted-foreground">{previewImage.label}</span>
                <Button variant="compact" onClick={() => handleDownload(previewImage.src, `${previewImage.label}.png`)}>
                  <Download />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
