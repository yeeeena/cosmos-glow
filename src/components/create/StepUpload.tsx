import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/ui/image-uploader";

interface StepUploadProps {
  productImage: string | null;
  onImageChange: (url: string | null) => void;
  onNext: () => void;
}

export function StepUpload({ productImage, onImageChange, onNext }: StepUploadProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">제품 이미지 업로드</h2>
        <p className="text-muted-foreground text-sm">
          컨셉샷으로 변환할 제품 이미지 1장을 업로드하세요
        </p>
      </div>

      <ImageUploadField
        value={productImage}
        onChange={onImageChange}
        className="w-64"
      />

      <Button
        onClick={onNext}
        disabled={!productImage}
        variant="glow"
        className="px-8"
      >
        다음단계
      </Button>
    </div>
  );
}
