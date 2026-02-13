import { useRef, forwardRef, useCallback } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  value?: string | null;
  onChange?: (url: string | null) => void;
  error?: boolean;
  className?: string;
}

export const ImageUploadField = forwardRef<HTMLDivElement, ImageUploadFieldProps>(
  ({ value, onChange, error, className }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          onChange?.(url);
        }
      },
      [onChange]
    );

    const removeImage = useCallback(() => {
      onChange?.(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, [onChange]);

    return (
      <div ref={ref} className={cn("relative", className)}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {value ? (
          <div className="relative group">
            <img
              src={value}
              alt="업로드된 이미지"
              className="w-full aspect-square rounded-xl border border-border object-contain bg-card"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full aspect-square rounded-2xl border-2 border-dashed bg-card/50 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-primary hover:text-primary transition-all hover:bg-primary/5 cursor-pointer",
              error ? "border-destructive" : "border-border"
            )}
          >
            <ImagePlus className="h-10 w-10" />
            <div className="text-center">
              <p className="text-sm font-medium">클릭하여 업로드</p>
              <p className="text-xs mt-1">PNG, JPG, WEBP</p>
            </div>
          </button>
        )}
      </div>
    );
  }
);

ImageUploadField.displayName = "ImageUploadField";
