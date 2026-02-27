import { ArrowRight, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/ui/image-uploader";

interface StepUploadProps {
  productImage: string | null;
  onImageChange: (url: string | null) => void;
  onNext: () => void;
}

export function StepUpload({ productImage, onImageChange, onNext }: StepUploadProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-8 w-full max-w-sm mx-auto">

      {/* Header — Align UI: tight typography */}
      <div className="text-center space-y-2">
        {/* Align UI: subtle step badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-primary/10 border border-primary/20 mb-2">
          <ImagePlus className="h-3 w-3 text-primary" strokeWidth={2} />
          <span className="text-label-xs text-primary uppercase tracking-wider">Step 1</span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight">제품 이미지 업로드</h2>
        <p className="text-paragraph-md text-muted-foreground">
          컨셉샷으로 변환할 제품 이미지 1장을 업로드하세요
        </p>
      </div>

      {/* Upload area */}
      <div className="w-full" style={{ maxWidth: "calc(100% - 20px)" }}>
        <ImageUploadField
          value={productImage}
          onChange={onImageChange}
          className="w-full"
        />
      </div>

      {/* Tips — Align UI: subtle card */}
      {!productImage && (
        <div className="w-full rounded-[12px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-2.5 shadow-[var(--shadow-xs)]">
          <p className="text-label-xs text-muted-foreground uppercase tracking-wider">업로드 팁</p>
          <ul className="space-y-2">
            {[
              "고해상도 이미지일수록 결과물이 좋아요",
              "배경이 단순한 이미지를 권장해요",
              "PNG · JPG · WEBP 형식 지원",
            ].map((tip) => (
              <li key={tip} className="flex items-center gap-2.5">
                <span className="w-1 h-1 rounded-full bg-primary/50 shrink-0" />
                <span className="text-paragraph-sm text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA — Align UI: glow variant */}
      <Button
        onClick={onNext}
        disabled={!productImage}
        variant="fancy"
        size="md"
        className="px-8 gap-2 font-semibold w-full"
      >
        다음단계
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
