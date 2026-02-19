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

  const analyzeProductForTexture = async (): Promise<boolean> => {
    if (!productImage) return false;

    setIsAnalyzing(true);
    try {
      // Convert blob URL to base64
      const response = await fetch(productImage);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const { data, error } = await supabase.functions.invoke("analyze-product", {
        body: { imageBase64: base64 },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setTextureAnalysis(data.analysis);
      setGenerationPrompt(data.generationPrompt);
      toast({
        title: "제품 분석 완료",
        description: data.analysis.texture_reason_ko,
      });
      return true;
    } catch (e) {
      console.error("Texture analysis error:", e);
      toast({
        title: "분석 실패",
        description: e instanceof Error ? e.message : "제품 분석 중 오류가 발생했습니다.",
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

  const handleGenerate = () => {
    setShowResult(true);
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
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
        {showResult ? (
          <ResultView isGenerating={isGenerating} onRestart={handleRestart} detailOptions={detailOptions} />
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
