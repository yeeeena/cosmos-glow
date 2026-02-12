import { useState, useRef } from "react";
import { Plus, ArrowRight, X, ImagePlus, Camera, Sparkles, Brush, Users, Sofa, Palette } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const EMPTY_GRID_COUNT = 8;

const stylePresets = [
  { value: "clean-studio", label: "클린 스튜디오", icon: Camera },
  { value: "model", label: "모델사용", icon: Users },
  { value: "lifestyle", label: "라이프스타일", icon: Sofa },
  { value: "art-directing", label: "아트디렉팅", icon: Brush },
  { value: "low-key", label: "로우키그라데이션", icon: Palette },
];

const ratioOptions = ["1:1", "3:4", "9:16", "16:9"];
const versionOptions = ["3v", "4v", "5v"];
const qualityOptions = ["Standard", "High", "Ultra"];

const CreatePage = () => {
  const [prompt, setPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("clean-studio");
  const [ratio, setRatio] = useState("9:16");
  const [version, setVersion] = useState("4v");
  const [quality, setQuality] = useState("High");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Image Grid Area */}
        <div className="flex-1 overflow-y-auto p-6 pb-0">
          <h1 className="text-2xl font-bold mb-6">생성</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: EMPTY_GRID_COUNT }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-lg border-2 border-dashed border-border bg-card/50 flex items-center justify-center transition-colors hover:bg-card hover:border-muted-foreground/30"
              >
                <Plus className="h-6 w-6 text-muted-foreground/40" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Input Bar — Fixed */}
        <div className="shrink-0 border-t border-border bg-background p-4 space-y-3">
          {/* Row 1: Upload + Style + Options */}
          <div className="flex items-start gap-3 flex-wrap">
            {/* 1. Product Image Upload */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">제품 이미지</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {uploadedImage ? (
                <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-border group">
                  <img src={uploadedImage} alt="업로드된 제품" className="h-full w-full object-cover" />
                  <button
                    onClick={removeImage}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-16 w-16 rounded-lg border-2 border-dashed border-border bg-card/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-[9px] font-medium">업로드</span>
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="h-[72px] w-px bg-border self-end" />

            {/* 2. Concept Style */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">컨셉 스타일</span>
              <ToggleGroup
                type="single"
                value={selectedStyle}
                onValueChange={(v) => v && setSelectedStyle(v)}
                className="justify-start gap-1.5 flex-wrap"
              >
                {stylePresets.map((style) => (
                  <ToggleGroupItem
                    key={style.value}
                    value={style.value}
                    className="h-8 px-3 rounded-lg border border-border bg-card text-xs gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary hover:bg-accent"
                  >
                    <style.icon className="h-3.5 w-3.5" />
                    {style.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {/* Divider */}
            <div className="h-[72px] w-px bg-border self-end" />

            {/* 3. Generation Options */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">생성 옵션</span>
              <div className="flex items-center gap-1.5">
                <OptionPopover label={ratio} title="비율" options={ratioOptions} value={ratio} onChange={setRatio} />
                <OptionPopover label={version} title="버전" options={versionOptions} value={version} onChange={setVersion} />
                <OptionPopover label={quality} title="품질" options={qualityOptions} value={quality} onChange={setQuality} />
              </div>
            </div>
          </div>

          {/* Row 2: Prompt + Generate */}
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="추가 설명을 입력하세요 (선택사항)"
                className="w-full bg-card border border-border rounded-lg pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              {prompt && (
                <button
                  onClick={() => setPrompt("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button variant="glow" className="rounded-[10px] px-5 gap-2 shrink-0">
              생성하기
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Credits */}
          <div className="text-xs text-muted-foreground text-center">
            Cost 16 credits ·{" "}
            <button className="text-primary hover:text-primary-hover underline underline-offset-2 transition-colors">
              더 많은 실행 횟수 얻기
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

function OptionPopover({
  label,
  title,
  options,
  value,
  onChange,
}: {
  label: string;
  title: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="h-8 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-accent transition-colors">
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">{title}</p>
        <div className="flex flex-col gap-0.5">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                value === opt
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-foreground"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default CreatePage;
