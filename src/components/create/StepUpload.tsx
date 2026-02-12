import { useRef } from "react";
import { ImagePlus, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepUploadProps {
  productImage: string | null;
  onImageChange: (url: string | null) => void;
  onNext: () => void;
}

export function StepUpload({ productImage, onImageChange, onNext }: StepUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onImageChange(url);
    }
  };

  const removeImage = () => {
    onImageChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">제품 이미지 업로드</h2>
        <p className="text-muted-foreground text-sm">
          컨셉샷으로 변환할 제품 이미지 1장을 업로드하세요
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {productImage ? (
        <div className="relative group">
          <img
            src={productImage}
            alt="업로드된 제품"
            className="max-w-xs max-h-72 rounded-xl border border-border object-contain bg-card"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-64 h-64 rounded-2xl border-2 border-dashed border-border bg-card/50 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-primary hover:text-primary transition-all hover:bg-primary/5 cursor-pointer"
        >
          <ImagePlus className="h-12 w-12" />
          <div className="text-center">
            <p className="text-sm font-medium">클릭하여 업로드</p>
            <p className="text-xs mt-1">PNG, JPG, WEBP · 1024×1024 이상 권장</p>
          </div>
        </button>
      )}

      <Button
        onClick={onNext}
        disabled={!productImage}
        variant="glow"
        className="px-8"
      >
        <Upload className="h-4 w-4 mr-2" />
        스타일 선택하기
      </Button>
    </div>
  );
}
