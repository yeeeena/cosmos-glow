import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import { StepIndicator } from "@/components/create/StepIndicator";
import { StepUpload } from "@/components/create/StepUpload";
import { StepStyle } from "@/components/create/StepStyle";
import { StepOptions } from "@/components/create/StepOptions";
import { ResultView } from "@/components/create/ResultView";

const STEPS = [
  { label: "제품 이미지", description: "업로드" },
  { label: "컨셉 스타일", description: "선택" },
  { label: "생성 옵션", description: "선택" },
];

interface DetailOptions {
  basicDetails: boolean;
  aiRecommended: boolean;
  selectedAIDetails: string[];
}

export interface TextureAnalysis {
  container_color: string;
  container_material: string;
  container_type: string;
  product_category: string;
  selected_texture: string;
  texture_reason_ko: string;
}

const TEXTURE_LABELS: Record<string, string> = {
  foam_lather: "폼 래더",
  cream_swirl: "크림 스월",
  gel_oil_drip: "젤 드립",
  crystal_grain: "크리스탈 그레인",
  silk_drape: "실크 드레이프",
  water_drops: "워터 드롭",
  mochi_stretch: "모찌 스트레치",
};

const CATEGORY_LABELS: Record<string, string> = {
  shampoo: "샴푸",
  "body wash": "바디워시",
  cleanser: "클렌저",
  serum: "세럼",
  ampoule: "앰플",
  moisturizer: "모이스처라이저",
  cream: "크림",
  mask: "마스크",
  scrub: "스크럽",
  toner: "토너",
  perfume: "퍼퓸",
  "body oil": "바디오일",
  other: "기타",
};

const CreatePage = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [detailOptions, setDetailOptions] = useState<DetailOptions>({
    basicDetails: false,
    aiRecommended: false,
    selectedAIDetails: [],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [textureAnalysis, setTextureAnalysis] = useState<TextureAnalysis | null>(null);
  const [generationPrompt, setGenerationPrompt] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const analyzeProductForTexture = async (): Promise<boolean> => {
    if (!productImage) return false;

    setIsAnalyzing(true);
    try {
      // Convert image to base64
      const response = await fetch(productImage);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const { data, error } = await supabase.functions.invoke("analyze-product", {
        body: { action: "analyze", imageBase64: base64 },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setTextureAnalysis(data.analysis);
      setGenerationPrompt(data.generationPrompt);

      const categoryKo = CATEGORY_LABELS[data.analysis.product_category] || data.analysis.product_category;
      const textureKo = TEXTURE_LABELS[data.analysis.selected_texture] || data.analysis.selected_texture;

      toast({
        title: `✓ ${categoryKo}(으)로 인식 — ${textureKo} 텍스처 자동 선택됨`,
        description: data.analysis.texture_reason_ko,
      });

      return true;
    } catch (e) {
      console.error("Texture analysis error:", e);
      toast({
        title: "분석 실패",
        description: "제품 분석에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStyleNext = async () => {
    if (selectedStyle === "texture-concept") {
      const success = await analyzeProductForTexture();
      if (!success) return;
    }
    setCurrentStep(3);
  };

  const handleGenerate = async () => {
    setShowResult(true);
    setIsGenerating(true);

    try {
      // If texture-concept style with a generation prompt, call HF FLUX.1-schnell
      if (selectedStyle === "texture-concept" && generationPrompt) {
        const { data, error } = await supabase.functions.invoke("analyze-product", {
          body: { action: "generate", prompt: generationPrompt },
        });

        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);
        if (!data?.imageDataUri) throw new Error("이미지 데이터를 받지 못했습니다.");

        setGeneratedImage(data.imageDataUri);
      } else {
        // Other styles: placeholder delay
        await new Promise((r) => setTimeout(r, 3000));
      }
    } catch (e) {
      console.error("Image generation error:", e);
      toast({
        title: "생성 실패",
        description: "이미지 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setProductImage(null);
    setSelectedStyle(null);
    setReferenceImage(null);
    setDetailOptions({ basicDetails: false, aiRecommended: false, selectedAIDetails: [] });
    setShowResult(false);
    setIsGenerating(false);
    setTextureAnalysis(null);
    setGenerationPrompt(null);
    setGeneratedImage(null);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="shrink-0 px-6 py-3 border-b border-border/50 flex items-center justify-between">
        <h1 className="text-sm font-semibold text-muted-foreground">컨셉샷 생성</h1>
        {!showResult && <StepIndicator currentStep={currentStep} steps={STEPS} />}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 flex">
        {/* Analyzing loading screen */}
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-6">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-lg font-semibold">Gemini가 제품을 분석 중입니다...</p>
              <p className="text-sm text-muted-foreground">
                제품 특성에 맞는 텍스처를 자동으로 선택하고 있어요
              </p>
            </div>
            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
            </div>
          </div>
        ) : showResult ? (
          <ResultView
            isGenerating={isGenerating}
            onRestart={handleRestart}
            detailOptions={detailOptions}
            generatedImage={generatedImage}
          />
        ) : currentStep === 1 ? (
          <StepUpload
            productImage={productImage}
            onImageChange={setProductImage}
            onNext={() => setCurrentStep(2)}
          />
        ) : currentStep === 2 ? (
          <StepStyle
            selectedStyle={selectedStyle}
            referenceImage={referenceImage}
            onStyleChange={setSelectedStyle}
            onReferenceChange={setReferenceImage}
            onNext={handleStyleNext}
            onBack={() => setCurrentStep(1)}
            isAnalyzing={isAnalyzing}
          />
        ) : (
          <StepOptions
            detailOptions={detailOptions}
            onDetailOptionsChange={setDetailOptions}
            onGenerate={handleGenerate}
            onBack={() => setCurrentStep(2)}
          />
        )}
      </div>
    </div>
  );
};

export default CreatePage;
