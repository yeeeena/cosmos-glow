import { useRef, forwardRef, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
            <Button
              variant="compact"
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X />
            </Button>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-0.5 -0.5 16 16"
              fill="none"
              className="h-7 w-7"
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
